/*global User jQuery _config AmazonCognitoIdentity AWSCognito bootbox*/

var User = window.User || {};

(function scopeWrapper($) {
    var signinUrl = '/signin.html';

    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    var userPool;

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }

    User.signOut = function signOut() {
        userPool.getCurrentUser().signOut();
    };

    User.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        var cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.getSession(function sessionCallback(err, session) {
                if (err) {
                    reject(err);
                }
                else if (!session.isValid()) {
                    resolve(null);
                }
                else {
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        }
        else {
            resolve(null);
        }
    });


    /*
     * Cognito User Pool functions
     */

    function register(email, password, student_id, onSuccess, onFailure) {
        var attributeList = [];
        var dataEmail = {
            Name: 'email',
            Value: email
        };
        var dataStudentId = {
            Name: 'custom:studentId',
            Value: student_id
        };
        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
        var attributeStudentId = new AmazonCognitoIdentity.CognitoUserAttribute(dataStudentId);

        attributeList.push(attributeEmail);
        attributeList.push(attributeStudentId);

        userPool.signUp(email, password, attributeList, null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                }
                else {
                    onFailure(err);
                }
            }
        );
    }

    function signin(email, password, onSuccess, onFailure) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: email,
            Password: password
        });

        var cognitoUser = createCognitoUser(email);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    }

    function verify(email, code, onSuccess, onFailure) {
        createCognitoUser(email).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            }
            else {
                onFailure(err);
            }
        });
    }

    function createCognitoUser(email) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: email,
            Pool: userPool
        });
    }

    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $('#signinForm').submit(handleSignin);
        $('#registrationForm').submit(handleRegister);
        $('#verifyForm').submit(handleVerify);
    });

    function handleSignin(event) {
        var email = $('#emailInputSignin').val();
        var password = $('#passwordInputSignin').val();
        event.preventDefault();
        signin(email, password,
            function signinSuccess() {
                console.log('Successfully Logged In');
                window.location.href = 'profile.html';
            },
            function signinError(err) {
                console.log(err);
                bootbox.alert({ message: err, backdrop: true });
            }
        );
    }

    function handleRegister(event) {
        var email = $('#emailInputRegister').val();
        var password = $('#passwordInputRegister').val();
        var student_id = $('#studentIdInputRegister').val();
        var onSuccess = function registerSuccess(result) {
            var cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            bootbox.alert({
                message: 'Registration successful. Please check your email inbox or spam folder for your verification code.',
                callback: () => {
                    window.location.href = 'verify.html';
                }
            });
        };
        var onFailure = function registerFailure(err) {
            bootbox.alert({ message: err, backdrop: true });
            console.log(err);
        };
        event.preventDefault();
        register(email, password, student_id, onSuccess, onFailure);
    }

    function handleVerify(event) {
        var email = $('#emailInputVerify').val();
        var code = $('#codeInputVerify').val();
        event.preventDefault();
        verify(email, code,
            function verifySuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully verified');
                bootbox.alert({
                    message: 'Verification successful. You will now be redirected to the login page.',
                    callback: () => {
                        window.location.href = signinUrl;
                    }
                });
            },
            function verifyError(err) {
                console.log(err);
                bootbox.alert({ message: err, backdrop: true });
            }
        );
    }
}(jQuery));
