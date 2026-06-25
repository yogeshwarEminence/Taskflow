pipeline {
    agent any

    environment {
        GIT_URL = credentials('git-url')
        APP_SERVER = credentials('app_server')

        EMAIL_TO = "yogeshwar.theeminence@gmail.com"
        SLACK_CHANNEL = "#jenkins-notifications"

        AWS_REGION = "ap-south-1"
        ECR_REGISTRY = "792612173141.dkr.ecr.ap-south-1.amazonaws.com"
        ECR_REPOSITORY = "taskflow"

        IMAGE_NAME = "taskflow"
        APP_NAME = "taskflow"
    }

    stages {

        stage("Select Branch") {
            steps {
                script {

                    cleanWs()

                    env.ENV = input(
                        message: "Select Deployment Environment",
                        parameters: [
                            choice(
                                name: 'BRANCH',
                                choices: ['PROD', 'DEV'],
                                description: 'Select Deployment Environment'
                            )
                        ]
                    )

                    if (env.ENV == "PROD") {
                        env.BRANCH_NAME = "main"
                    } else {
                        env.BRANCH_NAME = "dev"
                    }

                    echo "=================================="
                    echo "Environment : ${env.ENV}"
                    echo "Branch      : ${env.BRANCH_NAME}"
                    echo "=================================="
                }
            }
        }

        stage("Checkout Source Code") {
            steps {
                script {
                    try {

                        git branch: env.BRANCH_NAME,
                            url: env.GIT_URL

                    } catch (Exception e) {

                        echo "Checkout Failed"
                        echo "${e.getMessage()}"

                        throw e
                    }
                }
            }
        }

        stage("Build Docker Image") {
            steps {
                script {
                    try {

                        sh """
                            docker build -t ${IMAGE_NAME}:latest .
                        """

                    } catch (Exception e) {

                        echo "Docker Build Failed"
                        echo "${e.getMessage()}"

                        throw e
                    }
                }
            }
        }

        stage("Login To ECR") {
            steps {
                script {
                    try {

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
                            """
                        }

                    } catch (Exception e) {

                        echo "ECR Login Failed"
                        echo "${e.getMessage()}"

                        throw e
                    }
                }
            }
        }

        stage("Tag Docker Image") {
            steps {
                script {
                    try {

                        sh """
                            docker tag ${IMAGE_NAME}:latest ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest
                        """

                    } catch (Exception e) {

                        echo "Docker Tag Failed"
                        echo "${e.getMessage()}"

                        throw e
                    }
                }
            }
        }

        stage("Push Image To ECR") {
            steps {
                script {
                    try {

                        sh """
                            docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest
                        """

                    } catch (Exception e) {

                        echo "ECR Push Failed"
                        echo "${e.getMessage()}"

                        throw e
                    }
                }
            }
        }

        stage("Deploy To EC2") {
            steps {
                script {
                    try {

                        sh """
                            ssh -o StrictHostKeyChecking=no ubuntu@${APP_SERVER} '

                                aws ecr get-login-password --region ${AWS_REGION} | \
                                docker login --username AWS --password-stdin ${ECR_REGISTRY}

                                docker pull ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest

                                docker stop ${APP_NAME} || true

                                docker rm ${APP_NAME} || true

                                docker run -d \
                                    --name ${APP_NAME} \
                                    -p 80:80 \
                                    ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest
                            '
                        """

                    } catch (Exception e) {

                        echo "Deployment Failed"
                        echo "${e.getMessage()}"

                        throw e
                    }
                }
            }
        }
    }

    post {

        success {

            script {

                echo "=========================================="
                echo "Deployment Successful"
                echo "Environment : ${env.ENV}"
                echo "Branch      : ${env.BRANCH_NAME}"
                echo "Image       : ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest"
                echo "=========================================="

                emailext(
                    to: "${EMAIL_TO}",
                    subject: "Deployment Successful - ${env.ENV}",
                    body: """
Deployment Successful

Job Name    : ${JOB_NAME}
Build Number: ${BUILD_NUMBER}
Environment : ${env.ENV}
Branch      : ${env.BRANCH_NAME}

Build URL:
${BUILD_URL}
"""
                )

                slackSend(
                    channel: "${SLACK_CHANNEL}",
                    color: "good",
                    message: """
✅ Deployment Successful

Environment : ${env.ENV}
Branch      : ${env.BRANCH_NAME}

Build URL:
${BUILD_URL}
"""
                )
            }
        }

        failure {

            script {

                emailext(
                    to: "${EMAIL_TO}",
                    subject: "Deployment Failed - ${env.ENV}",
                    body: """
Deployment Failed

Job Name    : ${JOB_NAME}
Build Number: ${BUILD_NUMBER}

Build URL:
${BUILD_URL}
"""
                )

                slackSend(
                    channel: "${SLACK_CHANNEL}",
                    color: "danger",
                    message: """
❌ Deployment Failed

Environment : ${env.ENV}

Build URL:
${BUILD_URL}
"""
                )
            }
        }

        always {

            sh '''
                docker image prune -f || true
            '''

            cleanWs()
        }
    }
}
