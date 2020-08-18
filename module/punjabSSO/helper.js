const Request = require(GENERIC_HELPERS_PATH+'/http-request');
const punjabServiceBaseUrl = (process.env.PUNJAB_SERVICE_BASE_URL && process.env.PUNJAB_SERVICE_BASE_URL != "") ? process.env.PUNJAB_SERVICE_BASE_URL : ""
const punjabServiceKey = (process.env.PUNJAB_SERVICE_KEY && process.env.PUNJAB_SERVICE_KEY != "") ? process.env.PUNJAB_SERVICE_KEY : ""
const punjabServiceHost = (process.env.PUNJAB_SERVICE_HOST && process.env.PUNJAB_SERVICE_HOST != "") ? process.env.PUNJAB_SERVICE_HOST : ""
const encryptionEndpoint = "encryptedMethod"

const validateStaffLoginCredentialsEndpoint = "staffLogin"
const resendStaffCredentialsEndpoint = "forgetPassword"
const resetPasswordEndpoint = "resetPassword"

const punjabServiceDefaultPassword = (process.env.PUNJAB_SERVICE_DEFAULT_PASSWORD && process.env.PUNJAB_SERVICE_DEFAULT_PASSWORD != "") ? process.env.PUNJAB_SERVICE_DEFAULT_PASSWORD : ""
const punjabServiceDefaultMailDomain = (process.env.PUNJAB_SERVICE_DEFAULT_MAIL_DOMAIN && process.env.PUNJAB_SERVICE_DEFAULT_MAIL_DOMAIN != "") ? process.env.PUNJAB_SERVICE_DEFAULT_MAIL_DOMAIN : "@punjab.sl"

let sunbirdService = require(GENERIC_SERVICES_PATH + "/sunbird");

module.exports = class punjabSSOHelper {

    static encrypt(string = "") {
        return new Promise(async (resolve, reject) => {
            try {

                if(string == "") throw new Error("String cannot be blank.")

                let encryptionServiceData = await this.callPunjabService(encryptionEndpoint,{"values":string})

                let responseExtract = await this.validateWetherResponseIsSuccess(encryptionServiceData)

                if(responseExtract != "") {
                    return resolve(responseExtract);
                } else {
                    throw encryptionServiceData
                }

            } catch (error) {
                return reject(error);
            }
        })
    }


    static validateStaffLoginCredentials(staffID = "", password = "") {
        return new Promise(async (resolve, reject) => {
            try {

                if(staffID == "" || password == "") throw new Error("Invalid credentials.")

                let staffLoginData = await this.callPunjabService(validateStaffLoginCredentialsEndpoint,{"staffID":staffID,"password":password})
               
                let responseExtract = await this.validateWetherResponseIsSuccess(staffLoginData)

                if(responseExtract != "") {
                    try {
                        responseExtract = JSON.parse(responseExtract)
                    } catch (error) {
                        if(_.includes(responseExtract.toLowerCase(), 'message')) {
                            const invalidCharacters = new Array('[',']',':','message','Message','{','}')
                            invalidCharacters.forEach(charToReplace => {
                                responseExtract = _.replace(responseExtract, charToReplace, '');
                            })
                            throw new Error(_.trim(responseExtract))
                        }
                    }
                    return resolve(responseExtract[0]);
                } else {
                    throw new Error("Invalid credentials.")
                }
                

            } catch (error) {
                return reject(error);
            }
        })
    }


    static resendUserCredentials(staffID = "", mobileNo = "") {
        return new Promise(async (resolve, reject) => {
            try {

                if(staffID == "" || mobileNo == "") throw new Error("Invalid credentials.")

                let staffForgotPasswordData = await this.callPunjabService(resendStaffCredentialsEndpoint,{"staffID":staffID,"registeredMobileNo":mobileNo})

                let responseExtract = await this.validateWetherResponseIsSuccess(staffForgotPasswordData)
                
                if(responseExtract != "") {
                    if(responseExtract == "[{Message :Password has sent on your registered mobile number !!!}]") {
                        return resolve("Password has been sent on your registered mobile number.");
                    } else {
                        return resolve(responseExtract.replace('[{Message :', '').replace("}]",""));
                    }
                } else {
                    throw staffForgotPasswordData
                }
                

            } catch (error) {
                return reject(error);
            }
        })
    }

    static resetUserCredentials(facultyCode = "", oldPassword = "", password = "", confirmPassword = "") {
        return new Promise(async (resolve, reject) => {
            try {

                if(facultyCode == "" || oldPassword == "" || password == "" || confirmPassword == "") throw new Error("Invalid credentials.")

                let staffResetPasswordData = await this.callPunjabService(resetPasswordEndpoint,{"facultyCode":facultyCode,"oldPassword":oldPassword,"password":password,"confirmPassword":confirmPassword})

                let responseExtract = await this.validateWetherResponseIsSuccess(staffResetPasswordData)
                
                if(responseExtract != "") { 
                    if(responseExtract == "[{Message :Your password has chanced !!!}]") {
                        return resolve("Password reset successful.");
                    } else {
                        return resolve(responseExtract.replace('[{Message :', '').replace("}]",""));
                    }
                } else {
                    throw staffResetPasswordData
                }
                

            } catch (error) {
                return reject(error);
            }
        })
    }

    static validateWetherResponseIsSuccess(response) {
        return new Promise(async (resolve, reject) => {
            try {

                if(response && response.status && response.status == 200 && response.message && response.message == "Success" && response.data && response.data.string && response.data.string._text) {
                    return resolve(response.data.string._text);
                } else {
                    return resolve("");
                }
                

            } catch (error) {
                return reject(error);
            }
        })
    }

    static callPunjabService(endpoint = "", data = {}) {
        return new Promise(async (resolve, reject) => {
            try {

                if(punjabServiceBaseUrl == "" || punjabServiceKey == "" || punjabServiceHost == "" || endpoint == "") throw new Error("API Credentilas missing.")

                let reqObj = new Request()

                data["key"] = punjabServiceKey
                let options = {
                    type : "http",
                    form: data
                }
                
                options.headers = {
                    "Host": punjabServiceHost
                }

                let response = await reqObj.post(
                    punjabServiceBaseUrl+"/"+endpoint,
                    options
                )

                return resolve(response)

            } catch (error) {
                return reject(error);
            }
        })
    }


    static getKeyCloakAuthToken(staffID = "", staffDetails = {}) {
        return new Promise(async (resolve, reject) => {
            try {

                if(staffID == "") throw new Error("taffID cannot be blank.")

                if(punjabServiceDefaultPassword == "") throw new Error("Default Password not available.")

                let keyCloakData = await sunbirdService.getKeyCloakToken(staffID,punjabServiceDefaultPassword)
               
                if(keyCloakData.status == HTTP_STATUS_CODE.ok.status && keyCloakData.result) {
                    return resolve(keyCloakData.result);
                }

                if(keyCloakData.status != HTTP_STATUS_CODE.ok.status) {
                    
                    let userCreationResponse = await sunbirdService.createUser({
                        "firstName": staffDetails.staffName,
                        "lastName": "",
                        "userName": staffID,
                        "email": staffID + punjabServiceDefaultMailDomain,
                        "password":punjabServiceDefaultPassword
                    });
                   
                    if(userCreationResponse.status == HTTP_STATUS_CODE.ok.status && userCreationResponse.result && userCreationResponse.result.userId) {
                        
                        await UTILS.sleep(2000); // Wait for 2 seconds for new credentials to reflect in keycloak.
                        
                        keyCloakData = await sunbirdService.getKeyCloakToken(staffID,punjabServiceDefaultPassword)

                        if(keyCloakData.status == HTTP_STATUS_CODE.ok.status && keyCloakData.result) {
                            return resolve(keyCloakData.result);
                        } else {
                            throw keyCloakData.message
                        }

                    } else {
                        throw userCreationResponse.message
                    }

                } else {
                    throw keyCloakData.message
                }

            } catch (error) {
                return reject(error);
            }
        })
    }

};