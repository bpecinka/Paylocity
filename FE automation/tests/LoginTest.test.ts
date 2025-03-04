import { test, expect } from "@playwright/test";
import { LoginPage} from "../pages/LoginPage";
import { validCredentials, invalidCredentials, urls } from "../support/variables";


test.describe('Login Tests', () => {

    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goToLoginPage();
    });

    test('Successful login', async ({ page }) => {
        await loginPage.loginWithValidCredentials(validCredentials.validUsername, validCredentials.validPassword);
        await expect(page).toHaveURL(urls.baseURL + urls.dashboardUrl);
    });

    test('Unsuccessful login', async ({ page }) => {
        await loginPage.loginWithInvalidPassword(validCredentials.validUsername, invalidCredentials.invalidPassword);
        await expect(page).toHaveURL(urls.baseURL + urls.loginUrl);
        await loginPage.getErrorMessage();
        await loginPage.checkErrorMessage();
    });

});