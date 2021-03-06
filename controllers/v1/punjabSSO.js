const punjabSSOHelper = require(MODULES_BASE_PATH + "/punjabSSO/helper")

module.exports = class PunjabSSO {
  
  /**
   * @apiDefine errorBody
   * @apiError {String} status 4XX,5XX
   * @apiError {String} message Error
   */

  /**
   * @apiDefine successBody
   *  @apiSuccess {String} status 200
   * @apiSuccess {String} result Data
   */

  constructor() {
  }

  static get name() {
    return "punjabSSO";
  }

  /**
  * @api {post} /user-management/api/v1/punjabSSO/staffLogin Punjab Staff Login
  * @apiVersion 1.0.0
  * @apiName Punjab Staff Login
  * @apiGroup Punjab SSO
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /user-management/api/v1/punjabSSO/staffLogin
  * @apiParamExample {json} Request-Body:
  * 
  *   {
  *       "staffID" : "123123123",
  *       "password" : "123123123"
  *   }
  *
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  *  "result": [
        {
            "_id": "5da5914f2f3f790d7c1f34e7",
            "code": "OBS_DESIGNER",
            "title": "Observation Designer"
        }
      ]
  */

  staffLogin(req) {

    return new Promise(async (resolve, reject) => {

      try {

        const encryptedStaffID = await punjabSSOHelper.encrypt(req.body.staffID);

        if(!encryptedStaffID.data) throw new Error(encryptedStaffID.message);

        const encryptedPassword = await punjabSSOHelper.encrypt(req.body.password);

        if(!encryptedPassword.data) throw new Error(encryptedPassword.message);

        let loginResponse = await punjabSSOHelper.validateStaffLoginCredentials(encryptedStaffID.data, encryptedPassword.data);
      
        loginResponse = loginResponse.data;
        
        const keycloakData = await punjabSSOHelper.getKeyCloakAuthToken(loginResponse.staffID,loginResponse);
        loginResponse["tokenDetails"] = keycloakData.data;

        return resolve({
          message:  CONSTANTS.apiResponses.LOGIN_VERIFED,
          result: loginResponse
        });
  
    } catch (error) {
  
      return reject({
        status: 200,
        message: error.message || "Oops! something went wrong."
      })

    }



    })
  }


  /**
  * @api {post} /user-management/api/v1/punjabSSO/forgotPassword Punjab Staff Forgot Password
  * @apiVersion 1.0.0
  * @apiName Punjab Staff Forgot Password
  * @apiGroup Punjab SSO
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /user-management/api/v1/punjabSSO/forgotPassword
  * @apiParamExample {json} Request-Body:
  * 
  *   {
  *       "staffID" : "123123123",
  *       "registeredMobileNo" : "123123123"
  *   }
  *
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  *  "result": [
        {
            "_id": "5da5914f2f3f790d7c1f34e7",
            "code": "OBS_DESIGNER",
            "title": "Observation Designer"
        }
      ]
  */

  forgotPassword(req) {

    return new Promise(async (resolve, reject) => {

      try {

        const encryptedStaffID = await punjabSSOHelper.encrypt(req.body.staffID);

        if(!encryptedStaffID.data) throw new Error(encryptedStaffID.message);

        const encryptedMobileNo = await punjabSSOHelper.encrypt(req.body.registeredMobileNo);

        if(!encryptedMobileNo.data) throw new Error(encryptedMobileNo.message);


        let forgotPasswordResponse = await punjabSSOHelper.resendUserCredentials(encryptedStaffID.data, encryptedMobileNo.data);

        return resolve({
          message: forgotPasswordResponse.data
        });

      } catch (error) {

        return reject({
          status: error.status || 500,
          message: error.message || "Oops! something went wrong.",
          errorObject: error
        })

      }


    })
  }


  /**
  * @api {post} /user-management/api/v1/punjabSSO/resetPassword Punjab Staff Reset Password
  * @apiVersion 1.0.0
  * @apiName Punjab Staff Reset Password
  * @apiGroup Punjab SSO
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /user-management/api/v1/punjabSSO/resetPassword
  * @apiParamExample {json} Request-Body:
  * 
  *   {
  *       "facultyCode" : "123123123",
  *       "oldPassword" : "123123123",
  *       "password" : "123123123",
  *       "confirmPassword" : "123123123"
  *   }
  *
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  *  "result": [
        {
            "_id": "5da5914f2f3f790d7c1f34e7",
            "code": "OBS_DESIGNER",
            "title": "Observation Designer"
        }
      ]
  */

  resetPassword(req) {

      return new Promise(async (resolve, reject) => {

        try {

          const encryptedFacultyCode = await punjabSSOHelper.encrypt(req.body.facultyCode);

          if(!encryptedFacultyCode.data) throw new Error(encryptedFacultyCode.message);

          const encryptedOldPassword = await punjabSSOHelper.encrypt(req.body.oldPassword);

          if(!encryptedOldPassword.data) throw new Error(encryptedOldPassword.message);

          const encryptedNewPassword = await punjabSSOHelper.encrypt(req.body.password);

          if(!encryptedNewPassword.data) throw new Error(encryptedNewPassword.message);

          const encryptedConfirmPassword = await punjabSSOHelper.encrypt(req.body.confirmPassword);

          if(!encryptedConfirmPassword.data) throw new Error(encryptedConfirmPassword.message);

          let resetPasswordResponse = await punjabSSOHelper.resetUserCredentials(encryptedFacultyCode.data, encryptedOldPassword.data, encryptedNewPassword.data, encryptedConfirmPassword.data);

          return resolve({
            message: resetPasswordResponse.data 
          });

        } catch (error) {

          return reject({
            status: error.status || 500,
            message: error.message || "Oops! something went wrong.",
            errorObject: error
          })

        }


      })
  }

  /**
  * @api {post} /user-management/api/v1/punjabSSO/encryptionService Punjab Encryption Service
  * @apiVersion 1.0.0
  * @apiName Punjab Encryption Service
  * @apiGroup Punjab SSO
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /user-management/api/v1/punjabSSO/encryptionService
  * @apiParamExample {json} Request-Body:
  * 
  *   {
  *       "string" : "123123123"
  *   }
  *
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  *  "result": [
        {
            "string": "5da5914f2f3f790d7c1f34e7"
        }
      ]
  */

  encryptionService(req) {

      return new Promise(async (resolve, reject) => {

        try {

          let result = await punjabSSOHelper.encrypt(req.body.string);

          return resolve({
            message: CONSTANTS.apiResponses.ENCRYPTED,
            result: {string:result.data}
          });

        } catch (error) {

          return reject({
            status: error.status || 500,
            message: error.message || "Oops! something went wrong.",
            errorObject: error
          })

        }


      })
  }

};
