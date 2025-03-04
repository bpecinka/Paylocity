import { Page, Locator, expect } from '@playwright/test';
import {urls, validCredentials, invalidCredentials, errorMessages,} from "../support/variables";

export class LoginPage {
    private page: Page;
    private usernameField: Locator;
    private passwordField: Locator;
    private loginButton: Locator;
    private errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.usernameField = this.page.locator('#Username');
        this.passwordField = this.page.locator('#Password');
        this.loginButton = this.page.locator('button[type="submit"]');
        this.errorMessage = this.page.locator('.text-danger.validation-summary-errors');

    }

    async goToLoginPage() {
        await this.page.goto(urls.baseURL + urls.loginUrl);
    }

    async loginWithValidCredentials(username: string, password: string): Promise<void> {
        await this.usernameField.waitFor({state: "visible"})
        await this.usernameField.fill(validCredentials.validUsername);
        await this.passwordField.waitFor({state: "visible"})
        await this.passwordField.fill(validCredentials.validPassword);
        await this.loginButton.click();
    }

    async loginWithInvalidPassword(username: string, password: string): Promise<void> {
        await this.usernameField.waitFor({state: "visible"})
        await this.usernameField.fill(validCredentials.validUsername);
        await this.passwordField.waitFor({state: "visible"})
        await this.passwordField.fill(invalidCredentials.invalidPassword);
        await this.loginButton.click();
        await this.errorMessage.waitFor({state: "visible"})
    }

    async getErrorMessage(): Promise<string> {
        return this.errorMessage.innerText();
    }

    async checkErrorMessage(): Promise<void> {
        await expect(this.errorMessage).toHaveText(errorMessages.invalidPassword);
    }
}
