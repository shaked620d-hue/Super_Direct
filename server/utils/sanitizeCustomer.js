export const sanitizeCustomer = (customer) => {

const { password, ...safeCustomer } = customer;
return safeCustomer;

};
