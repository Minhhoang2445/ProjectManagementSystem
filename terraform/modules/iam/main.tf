data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}
data "aws_iam_policy_document" "github_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type = "Federated"

      identifiers = [
        data.aws_iam_openid_connect_provider.github.arn
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"

      values = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"

      values = [
        "repo:Minhhoang2445/ProjectManagementSystem:ref:refs/heads/main"
      ]
    }
  }
}
resource "aws_iam_role" "github_actions" {
  name = "github-actions-pms-frontend-deploy"

  assume_role_policy = data.aws_iam_policy_document.github_assume_role.json
}
resource "aws_iam_policy" "frontend_s3_deploy" {
  name        = "pms-frontend-s3-deploy"
  description = "Allow GitHub Actions to deploy frontend files to S3"

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "ListFrontendBucket"
        Effect = "Allow"

        Action = [
          "s3:ListBucket"
        ]

        Resource = [
          var.bucket_arn
        ]
      },
      {
        Sid    = "ManageFrontendObjects"
        Effect = "Allow"

        Action = [
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:AbortMultipartUpload",
          "s3:GetObject"
        ]

        Resource = [
          "${var.bucket_arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "github_s3_deploy" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.frontend_s3_deploy.arn
}
resource "aws_iam_policy" "frontend_cloudfront_invalidation" {
  name = "pms-frontend-cloudfront-invalidation"

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Action = [
          "cloudfront:CreateInvalidation"
        ]

        Resource = [
          var.distribution_arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "github_cloudfront_invalidation" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.frontend_cloudfront_invalidation.arn
}