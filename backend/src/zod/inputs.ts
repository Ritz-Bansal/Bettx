import zod from "zod";

export const SignupInputs = zod.object({
    name: zod.string(),
    email: zod.email({error: "Enter valid email"}),
    password: zod.string().min(3, {error: "Minimum length 3 requried bro"})
})

export const SigninInputs = zod.object({
    email: zod.email({error: "Enter valid email"}),
    password: zod.string().min(3, {error: "Remember, Minimum length 3"})
})

export const AmountInputs = zod.object({
    amount: zod.number().int({error: "Give integer bro"}),
    walletAddress: zod.string()
})

export const betInputs = zod.object({
    amount: zod.number().min(0.05),
    multiplier: zod.float32()
})


