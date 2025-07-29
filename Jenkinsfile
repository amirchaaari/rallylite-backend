pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
            sonarQubeScanner 'SonarScanner' 

    }

    environment {
        GHCR_REPO = 'ghcr.io/amirchaaari/rallylite-backend'
        GHCR_CREDENTIALS_ID = 'GHCR_PAT' // GitHub PAT stored in Jenkins credentials

        SONARQUBE_ENV = 'SonarQube' // Must match the Jenkins config name
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

  stage('Install Node.js Dependencies') {
    steps {
        sh 'npm install'
    }
}

stage('SonarQube Analysis') {
    steps {
        withSonarQubeEnv("${SONARQUBE_ENV}") {
            sh "npx sonar-scanner \
                -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                -Dsonar.sources=. \
                -Dsonar.host.url=$SONAR_HOST_URL \
                -Dsonar.login=$SONAR_AUTH_TOKEN"
        }
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
                    dockerImage = docker.build("${GHCR_REPO}:${IMAGE_TAG}", "--platform linux/amd64 .")
                }
            }
        }

        stage('Login to GHCR and Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${GHCR_CREDENTIALS_ID}",
                    usernameVariable: 'GHCR_USER',
                    passwordVariable: 'GHCR_PAT'
                )]) {
                    script {
                        sh '''
                           echo $GHCR_PAT | docker login ghcr.io -u $GHCR_USER --password-stdin
                            docker push ${GHCR_REPO}:${IMAGE_TAG}
                            docker tag ${GHCR_REPO}:${IMAGE_TAG} ${GHCR_REPO}:latest
                            docker push ${GHCR_REPO}:latest
                            docker logout ghcr.io
                        '''
                    } //test
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
            echo ' Pipeline completed successfully.'
        }
        failure {
            echo ' Pipeline failed. Check logs.'
        }
    }
}
