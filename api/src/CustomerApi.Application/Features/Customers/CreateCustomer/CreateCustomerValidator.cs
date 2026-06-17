using FluentValidation;

namespace CustomerApi.Application.Features.Customers.CreateCustomer;

/// <summary>
/// FluentValidation rules for the create command. The ValidationBehavior in the
/// MediatR pipeline runs this automatically before the handler. Keeping the rules
/// in the same feature folder is the "vertical slice" idea: everything one
/// feature needs sits together.
/// </summary>
public class CreateCustomerValidator : AbstractValidator<CreateCustomerCommand>
{
    public CreateCustomerValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.")
            .MaximumLength(50);

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required.")
            .MaximumLength(50);

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Email must be a valid email address.");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone is required.")
            .MaximumLength(30);
    }
}
