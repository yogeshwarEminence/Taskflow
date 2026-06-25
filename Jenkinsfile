pipeline {
    agent any

    environment {
        GIT_URL = credentials('git-url')
        APP_SERVER = credentials('app_server')

        AWS_REGION = "ap-south-1"
        ECR_REGISTRY = "792612173141.dkr.ecr.ap-south-1.amazonaws.com"
        ECR_REPOSITORY = "taskflow"

        IMAGE_NAME = "taskflow"
        CONTAINER_NAME = "taskflow-temp"
    }

    stages {

        stage("Select Environment") {
            steps {
                script {
                    cleanWs()

                    env.ENV = input(
                        message: "Select Environment",
                        parameters: [
                            choice(name: 'ENV', choices: ['PROD', 'DEV'], description: 'Deploy env')
                        ]
                    )

                    env.BRANCH_NAME = (env.ENV == "PROD") ? "main" : "dev"
                    env.DEPLOY_PATH = (env.ENV == "PROD") ? "/var/www/prod" : "/var/www/dev"
                    env.IMAGE_VERSION = (env.ENV == "PROD") ? "1.0.${BUILD_NUMBER} PROD" : "1.0.${BUILD_NUMBER} DEV"
    
                    echo "ENV: ${env.ENV}"
                    echo "BRANCH: ${env.BRANCH_NAME}"
                    echo "DEPLOY_PATH: ${env.DEPLOY_PATH}"
                }
            }
            post {
                always {
                    echo "=================================================================================================="
                }
            }
        }

        stage("Clone Repo") {
            steps {
                git branch: env.BRANCH_NAME, url: env.GIT_URL
            }
            post {
                always {
                    echo "=================================================================================================="
                }
            }
        }

        stage("Build Docker Image") {
            steps {
                sh """
                    docker build -t ${IMAGE_NAME}:${IMAGE_VERSION} .
                """
            }
            post {
                always {
                    echo "=================================================================================================="
                }
            }
        }

        stage("Push to ECR") {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'aws-creds',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} | \
                        docker login --username AWS --password-stdin ${ECR_REGISTRY}

                        docker tag ${IMAGE_NAME}:${IMAGE_VERSION} ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_VERSION}

                        docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_VERSION}
                    """
                }
            }
            post {
                always {
                    echo "=================================================================================================="
                }
            }
        }

        stage("Deploy on EC2 (Pull + Extract + Copy)") {
            steps {
                sh """
                    ssh -o StrictHostKeyChecking=no ubuntu@${APP_SERVER} '
                        aws ecr get-login-password --region ${AWS_REGION} | \
                        docker login --username AWS --password-stdin ${ECR_REGISTRY}

                        docker pull ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_VERSION}

                        docker rm -f ${CONTAINER_NAME} || true

                        CONTAINER_ID=\$(docker create ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_VERSION})

                        rm -rf /tmp/taskflow-dist
                        mkdir -p /tmp/taskflow-dist

                        docker cp \$CONTAINER_ID:/usr/share/nginx/html/. /tmp/taskflow-dist

                        docker rm -f \$CONTAINER_ID || true

                        sudo mkdir -p ${DEPLOY_PATH}
                        sudo rm -rf ${DEPLOY_PATH}/*

                        sudo cp -r /tmp/taskflow-dist/* ${DEPLOY_PATH}/

                        sudo systemctl reload nginx || sudo systemctl restart nginx || true
                    '
                """
            }
            post {
                always {
                    echo "=================================================================================================="
                }
            }
        }
    }

    post {
        success {
            slackSend(
                channel: "#jenkins-notifications",
                color: "good",
                message: "✅ Deployment SUCCESS (${env.ENV}) - ${BUILD_URL}"
            )
        }

        failure {
            slackSend(
                channel: "#jenkins-notifications",
                color: "danger",
                message: "❌ Deployment FAILED (${env.ENV}) - ${BUILD_URL}"
            )
        }

        always {
            cleanWs()
        }
    }
}