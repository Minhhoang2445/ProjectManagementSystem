
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