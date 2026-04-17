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
