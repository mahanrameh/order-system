export enum BadRequestMessage {
    InValidLoginData = 'اطلاعات ارسال شده برای ورود صحیح نمی‌باشد',
    InValidRegisterData = 'اطلاعات ارسال شده برای ثبت‌نام صحیح نمی‌باشد',
    MissingFields = 'برخی فیلدهای ضروری ارسال نشده‌اند',
    WeakPassword = 'رمز عبور انتخاب شده ضعیف است',
}

export enum AuthMessage {
    NotFoundAccount = 'حساب کاربری یافت نشد',
    AlreadyExistAccount = 'حساب کاربری با این مشخصات از قبل وجود دارد',
    ExpiredCode = 'کد تایید منقضی شده است',
    TryAgain = 'خطا رخ داد، لطفاً دوباره تلاش کنید',
    LoginRequired = 'لطفاً وارد حساب کاربری خود شوید',
    InvalidCredentials = 'ایمیل یا رمز عبور اشتباه است',
    RefreshTokenMissing = 'توکن بازنشانی یافت نشد',
    InvalidOrExpiredRefreshToken = 'توکن بازنشانی نامعتبر یا منقضی شده است',
    OtpVerificationFailed = 'کد تایید نامعتبر است',
}

export enum NotFoundMessage {
    NotFound = 'موردی یافت نشد',
    NotFoundCategory = 'دسته‌بندی یافت نشد',
    NotFoundPost = 'مقاله یافت نشد',
    NotFoundUser = 'کاربر یافت نشد',
    NotFoundRefreshToken = 'توکن بازنشانی یافت نشد',
    NotFoundOtp = 'کد تایید یافت نشد',
}

export enum ValidationMessage {
    InvalidEmailFormat = 'فرمت ایمیل صحیح نمی‌باشد',
    InvalidPhoneFormat = 'فرمت شماره تلفن صحیح نمی‌باشد',
    InvalidUsernameFormat = 'نام کاربری معتبر نمی‌باشد',
}

export enum PublicMessage {
    SentOtp = 'کد یک‌بار مصرف ارسال شد',
    LoggedIn = 'با موفقیت وارد حساب کاربری شدید',
    Created = 'با موفقیت ایجاد شد',
    Updated = 'با موفقیت به‌روزرسانی شد',
    Deleted = 'با موفقیت حذف شد',
    Inserted = 'با موفقیت درج شد',
    OtpVerified = 'کد تایید با موفقیت تأیید شد',
}

export enum ConflictMessage {
    CategoryTitle = 'عنوان دسته‌بندی قبلاً ثبت شده است',
    EmailAlreadyExists = 'ایمیل قبلاً ثبت شده است',
    PhoneAlreadyExists = 'شماره تلفن قبلاً ثبت شده است',
    UsernameAlreadyExists = 'نام کاربری قبلاً ثبت شده است',
}

export enum RoleMessage {
  NoRoleAssigned = 'نقش کاربر تنظیم نشده است',
  AccessDenied = 'دسترسی غیرمجاز: نقش شما مجاز به این عملیات نمی‌باشد',
  RequiresRoles = 'برای دسترسی به این مسیر نیاز به نقش‌های مشخص شده دارید',
}

export enum BasketMessage {
  ItemAdded = 'محصول با موفقیت به سبد خرید اضافه شد',
  ItemRemoved = 'محصول از سبد خرید حذف شد',
  BasketCleared = 'سبد خرید پاک شد',
  BasketFinalized = 'سبد خرید برای سفارش نهایی شد',
}
