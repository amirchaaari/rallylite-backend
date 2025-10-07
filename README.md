
# 🏗️ Rallylite Backend

The **Rallylite Backend** powers the Padel & Tennis matchmaking and tournament logic.
Players can post matches, request to join existing ones, and register for tournaments.
This is an early-stage project with plans to integrate **AI features** such as skill-based player matching and performance analytics.

Built with **NestJS** and **MongoDB**, it follows a modular architecture and includes a full CI/CD pipeline with Docker, Jenkins, and deployment to Azure Kubernetes Service (AKS).

-----

## 🧰 Tech Stack

  - **Framework:** NestJS
  - **Language:** TypeScript
  - **Database:** MongoDB
  - **ORM:** Mongoose
  - **Containerization:** Docker
  - **CI/CD:** Jenkins
  - **Security & Scanning:** SonarQube, Trivy, Gitleaks, Snyk, Checkov
  - **Deployment:** Azure Kubernetes Service (AKS)
  - **Container Registry:** GitHub Container Registry (GHCR)

-----

## 📁 Project Structure

```
rallylite-backend/
├── src/
│   ├── modules/
│   │   ├── players/
│   │   ├── matches/
│   │   └── tournaments/
│   ├── app.module.ts
│   └── main.ts
├── Dockerfile
├── Jenkinsfile
├── package.json
├── tsconfig.json
└── .env.example
```

-----

## ⚙️ Local Setup

#### 1\. Clone the repository

```bash
git clone https://github.com/your-username/rallylite-backend.git
cd rallylite-backend
```

#### 2\. Install dependencies

```bash
npm install
```

#### 3\. Run MongoDB locally

```bash
docker run -d --name mongo -p 27017:27017 mongo
```

#### 4\. Set environment variables

Create a `.env` file by copying `.env.example` and fill in the values:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/rallylite
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

#### 5\. Run the API

```bash
npm run start:dev
```

The backend will be available at 👉 `http://localhost:3000`

-----

## 🐳 Docker

#### Build the Docker image

```bash
docker build -t rallylite-backend .
```

#### Run the container

```bash
docker run -d -p 3000:3000 --env-file .env rallylite-backend
```

-----

## 🔁 CI/CD Pipeline (Jenkins)

### Pipeline Stages

1.  **Checkout:** Pull the latest code from GitHub.
2.  **Static Analysis:** Run SonarQube.
3.  **Security Scans:** Run Trivy, Gitleaks, Snyk, and Checkov.
4.  **Build:** Create the Docker image.
5.  **Push:** Upload the Docker image to GHCR.
6.  **Deploy:** Apply Kubernetes manifests to AKS.

### Example Jenkinsfile Commands

```groovy
// Example snippets from a Jenkinsfile
docker.build("ghcr.io/your-org/rallylite-backend:${env.BUILD_NUMBER}")
docker.withRegistry('https://ghcr.io', 'ghcr-credentials') {
    docker.image("ghcr.io/your-org/rallylite-backend:${env.BUILD_NUMBER}").push()
}
sh 'kubectl apply -f k8s/deployment.yaml'
```

-----

## 🌍 Deployment

  - Docker images are stored in **GitHub Container Registry (GHCR)**.
  - Kubernetes manifests describe the required resources:
      - **Deployment** for backend pods.
      - **Service** (ClusterIP or LoadBalancer) to expose the application.
      - **ConfigMap / Secret** for environment variables.
  - Jenkins automates the build, test, and deployment process to **Azure Kubernetes Service (AKS)**.

-----

## 🚀 Roadmap

  - Integrate AI-powered player match suggestions.
  - Add tournament prediction and insights.
  - Implement GraphQL support for faster queries.
  - Separate services for matches, tournaments, and AI analytics.

-----

## 📄 License

[MIT License](https://opensource.org/licenses/MIT) © 2025 Rallylite Team
