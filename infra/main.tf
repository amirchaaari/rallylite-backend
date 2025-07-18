provider "azurerm" {
  features {}
}

# Resource Group for AKS
resource "azurerm_resource_group" "rg" {
  name     = "aks-test-rg"
  location = "East US"  # Choose closest region to reduce latency
}

# Log Analytics Workspace for monitoring
resource "azurerm_log_analytics_workspace" "log_analytics" {
  name                = "aks-log-ws"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

# AKS Cluster
resource "azurerm_kubernetes_cluster" "aks" {
  name                = "aks-test-cluster"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "aks-test"

  default_node_pool {
    name       = "default"
    node_count = 2                           
    vm_size    = "Standard_B2s"               # 👈 Low-cost VM type
  }

  identity {
    type = "SystemAssigned"                   # 👈 AKS manages its own identity
  }

  # Monitoring via Azure Monitor
  addon_profile {
    oms_agent {
      enabled                    = true
      log_analytics_workspace_id = azurerm_log_analytics_workspace.log_analytics.id
    }
  }

  # Kubernetes version (optional, can use latest)
  role_based_access_control_enabled = true
  network_profile {
    network_plugin = "azure"
  }
}

# Output kubeconfig command
output "kube_admin_config_command" {
  value = "az aks get-credentials --resource-group ${azurerm_resource_group.rg.name} --name ${azurerm_kubernetes_cluster.aks.name} --admin"
}
