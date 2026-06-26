pipeline {
    agent any

    environment {
        GIT_URL        = credentials('git-url')
        APP_SERVER     = credentials('app_server')

        AWS_REGION     = "ap-south-1"
        ECR_REGISTRY   = "792612173141.dkr.ecr.ap-south-1.amazonaws.com"
        ECR_REPOSITORY = "taskflow"

        IMAGE_NAME     = "taskflow"
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
                            choice(
                                name: 'ENV',
                                choices: ['PROD', 'DEV'],
                                description: 'Deploy Environment'
                            )
                        ]
                    )

                    env.BRANCH_NAME = (env.ENV == "PROD") ? "main" : "dev"
                    env.DEPLOY_PATH = (env.ENV == "PROD") ? "/var/www/prod" : "/var/www/dev"
                    env.IMAGE_VERSION = "1.0.${BUILD_NUMBER}-${env.ENV}"

                    echo "Environment   : ${env.ENV}"
                    echo "Branch        : ${env.BRANCH_NAME}"
                    echo "Deploy Path   : ${env.DEPLOY_PATH}"
                    echo "Image Version : ${env.IMAGE_VERSION}"
                }
            }

            post {
                always {
                    echo "=================================================================================================="
                }
            }
        }

        stage("Clone Repository") {
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
                    docker build \
                        -t ${IMAGE_NAME}:${IMAGE_VERSION} .
                """
            }

            post {
                always {
                    echo "=================================================================================================="
                }
            }
        }

        stage("Trivy Security Scan") {
            steps {
                script {

                    // Generate HTML report
                    sh """
                        trivy image \
                            --severity HIGH,CRITICAL \
                            --format template \
                            --template "@/usr/local/share/trivy/html.tpl" \
                            --output trivy-report.html \
                            ${IMAGE_NAME}:${IMAGE_VERSION}
                    """

                    // Publish HTML report in Jenkins
                    publishHTML(target: [
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: '.',
                        reportFiles: 'trivy-report.html',
                        reportName: 'Trivy Security Report'
                    ])

                    // Fail build if vulnerabilities exist
                    sh """
                        trivy image \
                            --severity HIGH,CRITICAL \
                            --exit-code 1 \
                            ${IMAGE_NAME}:${IMAGE_VERSION}
                    """
                }
            }

            post {
                always {
                    archiveArtifacts artifacts: 'trivy-report.html', fingerprint: true
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

                        docker tag \
                            ${IMAGE_NAME}:${IMAGE_VERSION} \
                            ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_VERSION}

                        docker push \
                            ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_VERSION}
                    """
                }
            }

            post {
                always {
                    echo "=================================================================================================="
                }
            }
        }

        stage("Deploy on EC2") {
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

                        docker rm -f \$CONTAINER_ID

                        sudo mkdir -p ${DEPLOY_PATH}
                        sudo rm -rf ${DEPLOY_PATH}/*

                        sudo cp -r /tmp/taskflow-dist/* ${DEPLOY_PATH}/

                        sudo systemctl reload nginx || sudo systemctl restart nginx
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