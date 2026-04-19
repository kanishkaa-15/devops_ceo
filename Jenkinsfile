pipeline {
    agent any

    environment {
        REPO_URL = "https://github.com/kanishkaa-15/school-ceo-dashboard.git"
        DOCKER_IMAGE_BACKEND = "school-ceo-backend"
        DOCKER_IMAGE_FRONTEND = "school-ceo-frontend"
        // DOCKER_REGISTRY = "your-registry-url"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    echo 'Installing Backend Dependencies...'
                    dir('backend') {
                        bat 'npm install'
                    }
                    echo 'Installing Frontend Dependencies...'
                    bat 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Building Next.js Frontend...'
                bat 'npm run build'
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

        /*
        stage('Docker Push') {
            steps {
                script {
                    // Requires dockerLogin or custom credentials setup
                    // sh "docker tag ${DOCKER_IMAGE_BACKEND}:latest ${DOCKER_REGISTRY}/${DOCKER_IMAGE_BACKEND}:latest"
                    // sh "docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_BACKEND}:latest"
                    
                    // sh "docker tag ${DOCKER_IMAGE_FRONTEND}:latest ${DOCKER_REGISTRY}/${DOCKER_IMAGE_FRONTEND}:latest"
                    // sh "docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_FRONTEND}:latest"
                }
            }
        }
        */

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    echo 'Deploying to Kubernetes...'
                    // Requires kubectl to be configured on the Jenkins agent
                    bat 'kubectl apply -f k8s/'
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
