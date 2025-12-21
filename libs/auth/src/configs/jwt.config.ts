import { registerAs } from "@nestjs/config";
import { JwtModuleOptions } from "@nestjs/jwt";

export default registerAs('jwt', (): JwtModuleOptions => ({
    secret: process.env.COOKIE_SECRET,
    signOptions: { expiresIn: '1d' },
}));