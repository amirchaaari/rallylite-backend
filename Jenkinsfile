pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        GHCR_REPO = 'ghcr.io/amirchaaari/rallylite-backend'
        GHCR_CREDENTIALS_ID = 'GHCR_PAT'
        SONARQUBE_ENV = 'SonarQube'
        SONAR_PROJECT_KEY = 'rallylite'
    }

    stages {
        stage('Checkout Source Code') {
            steps {
                deleteDir()
                git branch: 'main',
                    credentialsId: "${GHCR_CREDENTIALS_ID}",
                    url: 'https://github.com/amirchaaari/rallylite-backend.git'
            }
        }

        stage('Dependency Audit') {
            steps {
                sh 'npm install'
                sh 'npm audit --audit-level=high || true'
            }
        }

        stage('Secrets Scan (Gitleaks)') {
            steps {
                sh 'gitleaks detect --source . --exit-code 1 || true'
            }
        }

        stage('Static Code Analysis (SonarQube)') {
            steps {
                withSonarQubeEnv("${SONARQUBE_ENV}") {
                    sh """
                        npx sonar-scanner \
                        -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=$SONAR_HOST_URL \
                        -Dsonar.login=$SONAR_AUTH_TOKEN
                    """
                }
            }
        }

        stage('IaC Scan (Checkov)') {
            steps {
                sh 'checkov -d k8s/ --quiet || true'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm run test'
            }
        }

        stage('Build Application') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def shortCommit = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.IMAGE_TAG = shortCommit
                    dockerImage = docker.build("${GHCR_REPO}:${IMAGE_TAG}", "--no-cache --platform linux/amd64 .")
                }
            }
        }

        stage('Image Scan (Trivy)') {
            steps {
                sh 'trivy image ${GHCR_REPO}:${IMAGE_TAG} || true'
            }
        }

        stage('Snyk Scan (Dependencies + Container)') {
            steps {
                sh '''
                snyk auth $SNYK_TOKEN || true
                snyk test || true
                snyk container test ${GHCR_REPO}:${IMAGE_TAG} || true
                '''
            }
        }

        stage('Push Docker Image to GHCR') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${GHCR_CREDENTIALS_ID}",
                    usernameVariable: 'GHCR_USER',
                    passwordVariable: 'GHCR_PAT'
                )]) {
                    sh '''
                        echo $GHCR_PAT | docker login ghcr.io -u $GHCR_USER --password-stdin
                        docker push ${GHCR_REPO}:${IMAGE_TAG}
                        docker tag ${GHCR_REPO}:${IMAGE_TAG} ${GHCR_REPO}:latest
                        docker push ${GHCR_REPO}:latest
                        docker logout ghcr.io
                    '''
                }
            }
        }

        stage('Deploy to AKS') {
            steps {
                sh '''
                    export IMAGE_TAG=${IMAGE_TAG}
                    envsubst < k8s/deployment-backend.yaml | kubectl apply -f -
                    kubectl apply -f k8s/service-backend.yaml
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully.'
        }
        failure {
            echo '❌ Pipeline failed. Check logs.'
        }
    }
}
