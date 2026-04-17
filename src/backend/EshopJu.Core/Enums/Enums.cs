namespace EshopJu.Core.Enums;

public enum OrderStatus
{
    Pending = 0,
    Confirmed = 1,
    Processing = 2,
    Shipped = 3,
    Delivered = 4,
    Cancelled = 5
}

public enum PaymentMethod
{
    BKash = 0,
    Nagad = 1,
    CashOnDelivery = 2
}

public enum PaymentStatus
{
    Pending = 0,
    Verified = 1,
    Rejected = 2
}

public enum UserRole
{
    Customer = 0,
    Admin = 1
}

public enum JerseyType
{
    NotApplicable = 0,
    Home = 1,
    Away = 2,
    Third = 3
}

public enum StockMovementType
{
    In = 0,
    Out = 1,
    Adjustment = 2,
    Return = 3
}

public enum DiscountType
{
    Percentage = 0,
    Fixed = 1,
    BuyXGetY = 2
}

public enum DiscountAppliesTo
{
    All = 0,
    Category = 1,
    Product = 2,
    Variant = 3
}

public enum DiscountSource
{
    Coupon = 0,
    Rule = 1
}
