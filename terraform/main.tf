
terraform{
    required_version = ">= 1.0.0"
    required_providers {
        aws = {
        source  = "hashicorp/aws"
        version = "~> 4.0"
        }
    }
}
provider "aws" {
    region = var.aws_region
}
# VPC Module
module "vpc" {
    source = "./modules/vpc"
    environment = var.environment
    vpc_cidr = var.vpc_cidr
    public_subnet_cidrs = var.public_subnet_cidrs
    public_subnet_azs = var.public_subnet_azs   
    private_subnet_cidrs = var.private_subnet_cidrs
    private_subnet_azs = var.private_subnet_azs
}
module "security"{
    source = "./modules/security"
    environment = var.environment
    vpc_id = module.vpc.vpc_id
}
module "rds"{
    source = "./modules/rds"
    environment = var.environment
    subnet_ids = module.vpc.private_subnet_ids
    db_name = var.db_name
    db_username = var.db_username
    db_password = var.db_password
    security_group_ids = module.security.database_security_group_id
}