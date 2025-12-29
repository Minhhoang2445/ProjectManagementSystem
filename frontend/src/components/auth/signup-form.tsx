import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router";
const signUpSchema = z.object({
  firstName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  lastName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  confirmPassword: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  designation: z.string().min(1, "Tên phải có ít nhất 1 ký tự"),
  department: z.string().min(1, "Tên phải có ít nhất 1 ký tự"),
});
type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignupForm({className,...props}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormValues) => {
    if (data.password !== data.confirmPassword) {
      alert("Mật khẩu không trùng khớp");
      return;
    }
    //gọi backend
    const {firstName, lastName, email, password, department, designation} = data;
    await authService.signUp(firstName, lastName, email, password, department, designation);
    navigate("/signin");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <Input
                    id="firstName"
                    placeholder="Minh"
                    required
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <p className="text-destructive text-sm">
                      {errors.firstName.message}
                    </p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <Input
                    id="lastName"
                    placeholder="Hoang"
                    required
                    {...register("lastName")}
                  />
                  {errors.lastName && (
                    <p className="text-destructive text-sm">
                      {errors.lastName.message}
                    </p>
                  )}
                </Field>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-destructive text-sm">
                    {errors.email.message}
                  </p>
                )}
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      required
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="text-destructive text-sm">
                        {errors.password.message}
                      </p>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      required
                      {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                      <p className="text-destructive text-sm">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="designation">Designation</FieldLabel>
                <Input
                  id="designation"
                  placeholder="Developer / Manager / Tester"
                  required
                  {...register("designation")}
                />
                {errors.designation && (
                  <p className="text-destructive text-sm">
                    {errors.designation.message}
                  </p>
                )}
              </Field>

              {/* Department */}
              <Field>
                <FieldLabel htmlFor="department">Department</FieldLabel>
                <Input
                  id="department"
                  placeholder="IT / HR / Finance / Marketing"
                  required
                  {...register("department")}
                />
                {errors.department && (
                  <p className="text-destructive text-sm">
                    {errors.department.message}
                  </p>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  Create Account
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <a href="/signin">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
