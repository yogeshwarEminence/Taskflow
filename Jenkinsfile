pipeline {
    agent any

    environment {
        GIT_URL        = credentials('git-url')

        AWS_REGION     = "ap-south-1"
        ECR_REGISTRY   = "792612173141.dkr.ecr.ap-south-1.amazonaws.com"
        ECR_REPOSITORY = "taskflow"

        IMAGE_NAME     = "taskflow"
        CONTAINER_NAME = "taskflow-temp"

        TRIVY_CACHE_DIR = "/opt/trivy-cache"
    }

    stages {

        stage("Select Environment") {
            steps {
                script {

                    cleanWs()

                    env.ENV = input(
                        message: "Select Environment",
                        parameters: [
                            choice(
                                name: 'ENV',
                                choices: ['PROD', 'DEV'],
                                description: 'Deploy Environment'
                            )
                        ]
                    )


                    env.BRANCH_NAME = (env.ENV == "PROD") ? "main" : "dev"

                    env.DEPLOY_PATH = (env.ENV == "PROD") ?
                        "/var/www/prod" :
                        "/var/www/dev"


                    // Dynamic server based on environment
                    env.APP_SERVER = (env.ENV == "PROD") ?
                        "tqzom.xyz" :
                        "dev.tqzom.xyz"


                    env.IMAGE_VERSION = "1.0.${BUILD_NUMBER}-${env.ENV}"


                    echo "Environment   : ${env.ENV}"
                    echo "Branch        : ${env.BRANCH_NAME}"
                    echo "Deploy Server : ${env.APP_SERVER}"
                    echo "Deploy Path   : ${env.DEPLOY_PATH}"
                    echo "Image Version : ${env.IMAGE_VERSION}"
                }
            }
        }


        stage("Clone Repository") {
            steps {
                git branch: env.BRANCH_NAME,
                    url: env.GIT_URL
            }
        }


        stage("Build Docker Image") {
            steps {
                sh """
                    docker build \
                    -t ${IMAGE_NAME}:${IMAGE_VERSION} .
                """
            }
        }


        stage("Trivy Security Scan") {
            steps {
                script {

                    sh """

                    mkdir -p trivy-reports
                    mkdir -p ${TRIVY_CACHE_DIR}


                    trivy image \
                    --cache-dir ${TRIVY_CACHE_DIR} \
                    --scanners vuln \
                    --pkg-types os \
                    --format template \
                    --template @/usr/local/share/trivy/html.tpl \
                    --output trivy-reports/trivy-report.html \
                    ${IMAGE_NAME}:${IMAGE_VERSION}

                    """


                    publishHTML(
                        target: [
                            allowMissing: false,
                            alwaysLinkToLastBuild: true,
                            keepAll: true,
                            reportDir: 'trivy-reports',
                            reportFiles: 'trivy-report.html',
                            reportName: 'Trivy Security Report'
                        ]
                    )
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

                    aws ecr get-login-password \
                    --region ${AWS_REGION} | \
                    docker login \
                    --username AWS \
                    --password-stdin ${ECR_REGISTRY}


                    docker tag \
                    ${IMAGE_NAME}:${IMAGE_VERSION} \
                    ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_VERSION}


                    docker push \
                    ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_VERSION}

                    """
                }
            }
        }



        stage("Deploy on EC2") {

            steps {

                sh """

                ssh -o StrictHostKeyChecking=no ubuntu@${APP_SERVER} '

                set -e


                aws ecr get-login-password \
                --region ${AWS_REGION} | \
                docker login \
                --username AWS \
                --password-stdin ${ECR_REGISTRY}



                docker pull \
                ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_VERSION}



                docker rm -f ${CONTAINER_NAME} || true



                docker create \
                --name temp_extract \
                ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_VERSION}



                sudo rm -rf ${DEPLOY_PATH}


                sudo mkdir -p ${DEPLOY_PATH}


                sudo chmod -R 777 ${DEPLOY_PATH}



                docker cp \
                temp_extract:/usr/share/nginx/html/. \
                ${DEPLOY_PATH}



                docker rm temp_extract



                echo "Deployment successful"

                '

                """
            }
        }



        stage("Cleanup Local Images") {

            steps {

                sh """

                docker rmi \
                ${IMAGE_NAME}:${IMAGE_VERSION} || true


                docker rmi \
                ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_VERSION} || true


                docker image prune -af \
                --filter "until=24h" || true

                """
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