pipeline {
    agent any

    environment {
        REPO_URL = "https://github.com/kanishkaa-15/devops_ceo.git"
        DOCKER_IMAGE_BACKEND = "school-ceo-backend"
        DOCKER_IMAGE_FRONTEND = "school-ceo-frontend"
        DOCKER_REGISTRY = "kanishkaa123"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    echo 'Building Backend Docker Image...'
                    bat "docker build -t ${DOCKER_IMAGE_BACKEND}:latest ./backend"
                    
                    echo 'Building Frontend Docker Image...'
                    bat "docker build -t ${DOCKER_IMAGE_FRONTEND}:latest ."
                }
            }
        }

        stage('Docker Push') {
            steps {
                script {
                    // Using withCredentials and bat for better compatibility on Windows Jenkins
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        echo 'Logging into Docker Hub...'
                        bat "docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}"
                        
                        echo 'Pushing Backend Docker Image...'
                        bat "docker tag ${DOCKER_IMAGE_BACKEND}:latest ${DOCKER_REGISTRY}/${DOCKER_IMAGE_BACKEND}:latest"
                        bat "docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_BACKEND}:latest"
                        
                        echo 'Pushing Frontend Docker Image...'
                        bat "docker tag ${DOCKER_IMAGE_FRONTEND}:latest ${DOCKER_REGISTRY}/${DOCKER_IMAGE_FRONTEND}:latest"
                        bat "docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_FRONTEND}:latest"
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    echo 'Deploying to Kubernetes...'
                    // Using --validate=false to bypass the OpenAPI validation error seen in Jenkins logs
                    bat "kubectl apply -f k8s/ --validate=false"
                }
            }
        }

    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check logs.'
        }
    }
}
