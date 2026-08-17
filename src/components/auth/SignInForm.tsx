import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { Button, Form, Input, message } from 'antd';
import { loginRequest } from "../../model/User";
import { useAuth } from "../../hooks/useAuth";

export default function SignInForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<loginRequest>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { useLogin } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<loginRequest> = async (data) => {
    try {
      useLogin.mutate(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";
      message.error(msg);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Controller
                    control={control}
                    name="email"
                    rules={{ required: "Please enter your email" }}
                    render={({ field }) => (
                      <Form.Item
                        validateStatus={errors.email ? "error" : ""}
                        help={errors.email?.message}
                        className="mb-0"
                      >
                        <Input
                          {...field}
                          placeholder="example@gmail.com"
                        />
                      </Form.Item>
                    )}
                  />
                </div>

                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Controller
                      control={control}
                      name="password"
                      rules={{ required: "Please enter your password" }}
                      render={({ field }) => (
                        <Form.Item
                          validateStatus={errors.password ? "error" : ""}
                          help={errors.password?.message}
                          className="mb-0"
                        >
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                          />
                        </Form.Item>
                      )}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <Form.Item label={null}>
                    <Button type="primary" htmlType="submit" className="w-full">
                      Sign in
                    </Button>
                  </Form.Item>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

