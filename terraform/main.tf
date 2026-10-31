
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
module "asg" {
    source = "./modules/asg"
    environment = var.environment
    instance_type = var.instance_type
    key_name = var.key_name
    security_group_ids = module.security.app_security_group_id
    private_subnet_ids = module.vpc.private_subnet_ids
    bastion_security_group_id = module.security.bastion_security_group_id
    target_group_arns = [module.alb.target_group_arn]
    min_size = var.min_size
    max_size = var.max_size
    desired_capacity = var.desired_capacity
    public_subnet_ids = module.vpc.public_subnet_ids
}
module "alb" {
  source = "./modules/alb"
  environment     = var.environment
  vpc_id         = module.vpc.vpc_id
  public_subnets = module.vpc.public_subnet_ids
  alb_security_group_id = module.security.alb_security_group_id
}
module "s3" {
  source = "./modules/s3"
  environment = var.environment
  cloudfront_distribution_arn = module.cloudfront.cloudfront_distribution_arn
}
module "cloudfront" {
  source = "./modules/cloudfront"
  environment = var.environment
  s3_bucket_domain_name = module.s3.bucket_regional_domain_name

}
module "route53" {
  source = "./modules/route53"
  domain_name = var.domain_name
  hosted_zone_name = var.hosted_zone_name
  cloudfront_hosted_zone_id = module.cloudfront.cloudfront_hosted_zone_id
  cloudfront_domain_name = module.cloudfront.cloudfront_domain_name
}