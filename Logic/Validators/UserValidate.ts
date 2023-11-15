import joi from 'joi';

const UsernameJoi = joi.string().min(3).max(20).required();

export const RegisterRequest = joi.object({
    username: UsernameJoi,
    password: joi.string().min(8).max(20).required()
})

export const PermissionsJoi = joi.object({
    module_name: joi.string().required(),
    permitted_actions: joi.array().items(joi.string()).min(1)
})

export const CheckPermissionJoi = joi.object({
    token: joi.string(),
    needed_permission: PermissionsJoi
});

export const AddPermissionJoi = joi.object({
    token: joi.string(),
    add_to: UsernameJoi,
    permit: joi.array().items(PermissionsJoi).min(1)
})