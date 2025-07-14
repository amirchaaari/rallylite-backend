pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        GHCR_REPO = 'ghcr.io/amirchaaari/rallylite-backend'
        GHCR_CREDENTIALS_ID = 'GHCR_PAT' // GitHub PAT stored in Jenkins credentials
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
                    dockerImage = docker.build("${GHCR_REPO}:latest")
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
                            docker push ghcr.io/amirchaaari/rallylite-backend:latest
                            docker logout ghcr.io
                        '''
                    }
                }
            }
        }


        stage('Deploy to Kubernetes') {
            steps {

                				script {
                    kubeconfig(caCertificate: 'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURCakNDQWU2Z0F3SUJBZ0lCQVRBTkJna3Foa2lHOXcwQkFRc0ZBREFWTVJNd0VRWURWUVFERXdwdGFXNXAKYTNWaVpVTkJNQjRYRFRJMU1EY3dOekl4TURNd01Gb1hEVE0xTURjd05qSXhNRE13TUZvd0ZURVRNQkVHQTFVRQpBeE1LYldsdWFXdDFZbVZEUVRDQ0FTSXdEUVlKS29aSWh2Y05BUUVCQlFBRGdnRVBBRENDQVFvQ2dnRUJBTVdSCnkzL2JjUjZpQUJJc1lHWm8ySjByT3p4N0FFSjQrK3ZyUjdzcHVVeGhpM1hBVyt3VGJONUoxSVpacEM1cEZQYjAKdXFFeTRnM3FaTzB3MFNvcitDSzlBRzVzOG1oTXFhUjkrZEFOL1Z3MVFVelRzTFhiQWJGdkRQS3lOS2d2RVFIVwppcDZqaFo3VUNadFVTNFJaMmQ1SlN6STVndDRKZWpHd2xaZzlHSWZwSmJEUFE1QnpJQy8zRmlFNGsrNHVRL3I3CjU3MXE5MjZ4ZFcrUmFhRlMrYjFqWjBsQjUxZjcwK1BiTjdsanVCUzRjeXp4SG15UlViVkJRMHAxQkVYb3FzU3UKMkpUUVo3MG05cU9paGNFdlhxMDdFTGhQWEtiTGNDcEF6NmoyOG5oKzZiS09ZWEl5V1MvdXNyYVlRMW4xVUxNdworK0dLUFpReWxkb0xzdW1kM0FFQ0F3RUFBYU5oTUY4d0RnWURWUjBQQVFIL0JBUURBZ0trTUIwR0ExVWRKUVFXCk1CUUdDQ3NHQVFVRkJ3TUNCZ2dyQmdFRkJRY0RBVEFQQmdOVkhSTUJBZjhFQlRBREFRSC9NQjBHQTFVZERnUVcKQkJTUDErR1FTL3dhSEh6d1p3OGp4dnlsMzdoT0xEQU5CZ2txaGtpRzl3MEJBUXNGQUFPQ0FRRUFmYk5JZDdKcApYSWcvSUkzTHJOT0E3cXI2LzR5VGZZblYwNU1RRlp3dE9vN2dYSFJYNzBtY2NVTlc2b1NHaU5SWjRHdlpISlZkCktGUUdlT2tVdjJuT2ZJdTVtV3FxSytwNkwyS1YxdEtqOC8yckJyTTlOYWdDdFEvckJqZTVseG84YUFRbGdPaG4KNDZtM1QrU0JmanVMWEhHT3RGbWJqNHJSd3k1dWl3R0prbXAwaFUrNis0REV2R1FLOGRxQkdxbGYvZmhOUU51UQpMMkZYcndmTnAwL2JVMGpvZDkzNC9yRG5xZU5qRzIyRFVwU0d3Qlp1Rk1hNGFLNmFOaWl5M29zL0JqNEdDeUdjCjF0aWk0Nm9SK1NtK09EdHpXUVMrYm03cXpvRVJBM1VrU1cxWFpRZUtTR2xxZHI0Wm5kR0V3T1NNNi9qS1ZVMDMKRUNRRkRJYktoa3VFcGc9PQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==', credentialsId: 'kubeconfig', serverUrl: 'https://127.0.0.1:50200') {
    // some block
}

sh 'kubectl apply -f k8s/'

       				}
    
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
