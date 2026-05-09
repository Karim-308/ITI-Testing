const {isValidPassword} = require('./validatior');


describe("isValidPassword", () => {

    it("should succeed and return object with valid= true when password is valid", () => {

        const result = isValidPassword("ApasswordWithmoreThan8CharsadubercasseAndNumbers123");

        expect(result).toEqual({ valid: true, reason: "" });
    });


    it("should fail and return object with valid= false when password is shorter than 8 characters", () => {

        const result = isValidPassword("Shorty1");

        expect(result).toEqual({ valid: false, reason: "Too short (min 8 characters)" });
    });

    it("should fail and return object with valid= false when password has no uppercase letters", () => {

        const result = isValidPassword("nouppercasse22");

        expect(result).toEqual({ valid: false, reason: 'Must contain an uppercase letter' });
    });

    it("should fail and return object with valid= false when password has uppercase letters but no numbers", () => {

        const result = isValidPassword("I have no numbers haha");

        expect(result).toEqual({ valid: false, reason: 'Must contain a number' });
    });

    it("should fail and return object with valid= false when password has uppercase letters but no numbers", () => {

        const result = isValidPassword("I have no numbers haha");

        expect(result).toEqual({ valid: false, reason: 'Must contain a number' });
    });

    it("should fail and return object with valid= false when password has uppercase letters but no numbers", () => {

        const result = isValidPassword("I have no numbers haha");

        expect(result).toEqual({ valid: false, reason: 'Must contain a number' });
    });

    it("should fail and return object with valid= false when passed a null", () => {

        const result = isValidPassword(null);

        expect(result).toEqual({ valid: false, reason: 'Password must be a string' });
    });

    it("should fail and return object with valid= false when passed undefined", () => {

        const result = isValidPassword(undefined);

        expect(result).toEqual({ valid: false, reason: 'Password must be a string' });
    });

    it("should fail and return object with valid= false when passed a number", () => {

        const result = isValidPassword(1225566648);

        expect(result).toEqual({ valid: false, reason: 'Password must be a string' });
    });

    it("should fail and return object with valid= false when passed a number", () => {

        const result = isValidPassword(1225566648);

        expect(result).toEqual({ valid: false, reason: 'Password must be a string' });
    });

    it("should pass and return object with valid= true when passed exactly 8 characters", () => {

        const result = isValidPassword("DoubleO7");

        expect(result).toEqual({ valid: true, reason: "" });
    });

    it("should pass and return object with valid= true when passed a huge password", () => {

        const result = isValidPassword("Gkfjndjksnfkneriknsgbyyuitb78t678trv67ivr67vr7vr7rv675ec5454x3w5w54xce56bt78bty78y7nb87b7yby787rv6ec56xw53wx3x4ws54cd56edd5vtb68ny7ny89yn98oyn897non78tob8bf6ibf6ri5vd7d5vvd56v5d6bb68b877n7n7gn7n7n7n7g8n7gg7n8o787878g71161846184618146814646184618416ujmikjmi4614618624jikijuy8oyo7on7o7o7o8bg78obg678f67if67ivd56d546cds4gnnlrenhliwhelguberlgbseliugbseluigbergiuesrbiughbeuilgse98ger4g9g8se4g9ers4g9esr4g9s4er98gseghsgrhuiegrshuuhsgsrhuilghuh02t374h08273ht40723h40t7243hh0ththerh703t4g703t4h7h7t347h0t3h704h70wth708wgh780t870gwt874th78twh78t7h80th078th073w843hwt7403h7wt40wth78034wh8t78th7038h7wt34h7wth078wt84h7w0th84h80wt4hrtbyuisegrbiorsgbunipesgrbipupbiuguy3tgwg783tg78w4g8y7wtgb8t4gb8t4brbugrbiyugbuipsgbpuibuipsdgfbuipgestrbpiusbuipgbug5wg78t5gy7bt075w0gb7w5b0gy78bg7w5yb75yb7y54bweubipsesh4h4146h467h6748h47dgf437g43dgfh437");

        expect(result).toEqual({ valid: true, reason: "" });
    });


    it("should fail and return object with valid= false when passed an empty string", () => {

        const result = isValidPassword("");

        expect(result).toEqual({ valid: false, reason: "Too short (min 8 characters)" });
    });   
    
    it("should fail and return object with valid= false when passed an object", () => {

        const result = isValidPassword({valid: true});

        expect(result).toEqual({ valid: false, reason: "Password must be a string" });
    });

    it("should fail and return object with an uppercase from german", () => {

        const result = isValidPassword("Äber gut passwords");

        expect(result).toEqual({ valid: false, reason: 'Must contain an uppercase letter' });
    });

    it("should fail and return object with valid= false when passed a string with only spaces", () => {

        const result = isValidPassword("        ");

        expect(result).toEqual({ valid: false, reason: 'Must contain an uppercase letter' });
    
    });

     it("should succeeded and return object with valid= true when passed a newline character", () => {

        const result = isValidPassword("Makeworlf\nabetterplace22");

        expect(result).toEqual({ valid: true, reason: "" });
    
    });

    

});







/**
 * 
 * 
 * 1
Happy path
A strong valid password returns valid: true and an empty reason.
2
Too short
A 7-character password should fail with the "Too short" reason.
3
No uppercase
A password with only lowercase + numbers should fail.
4
No number
Letters only, even with uppercase, should fail.
5
Wrong type
Pass a number, null, or undefined instead of a string.
6
Edge case
What's the shortest possible valid password? Test exactly 8 chars.
 */