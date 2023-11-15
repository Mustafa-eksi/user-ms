import joi from 'joi';

export const RegisterRequest = joi.object({
    username: joi.string().min(3).max(20).required(),
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