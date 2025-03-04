import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { EmployeeDashboardPage } from "../pages/DashboardPage";
import { validCredentials, employee } from "../support/variables";

test.describe('Dashboard test', () => {
    let employeeDashboardPage: EmployeeDashboardPage;

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        employeeDashboardPage = new EmployeeDashboardPage(page);

        await loginPage.goToLoginPage();
        await loginPage.loginWithValidCredentials(validCredentials.validUsername, validCredentials.validPassword);
    });

    test.afterEach(async ({ page }) => {
        await page.context().clearCookies();
        await page.context().clearPermissions();
    });

    test('Employee list should not be empty', async () => {
        const employeeCount = await employeeDashboardPage.getEmployeeCount();
        expect(employeeCount).toBeGreaterThan(0);
    });

    test('Add new employee', async () => {
        const firstName = 'Playwright';
        const lastName = 'Test';
        const dependants = 1;

        await employeeDashboardPage.addEmployee(firstName, lastName, dependants);

        const employeeCount = await employeeDashboardPage.getEmployeeCount();
        expect(employeeCount).toBeGreaterThan(0);
    });

    test('Edit employee', async () => {
        const firstName = 'Playwright';
        const lastName = 'TestOriginalValue';
        const dependants = 1;

        await employeeDashboardPage.addEmployee(firstName, lastName, dependants);
        const newEmployeeId = await employeeDashboardPage.getNewEmployeeId();

        const updatedFirstName = 'PlaywrightUpdated';
        const updatedLastName = 'TestUpdateValue';
        const updatedDependants = 2;

        const rowsBefore = await employeeDashboardPage.getEmployeeCount();

        await employeeDashboardPage.editEmployee(newEmployeeId, updatedFirstName, updatedLastName, updatedDependants);

        const rowsAfter = await employeeDashboardPage.getEmployeeCount();
        expect(rowsBefore).toBe(rowsAfter);

        const updatedRow = employeeDashboardPage.getEmployeeTable().locator(`tr:has(td:nth-child(1):text("${newEmployeeId}"))`);

        await expect(updatedRow.locator('td:nth-child(2)')).toHaveText(updatedFirstName);
        await expect(updatedRow.locator('td:nth-child(3)')).toHaveText(updatedLastName);
        await expect(updatedRow.locator('td:nth-child(4)')).toHaveText(updatedDependants.toString());
    });

    test('Delete employee', async () => {
        const firstName = 'Playwright';
        const lastName = 'Delete';
        const dependants = 1;

        const rowsBefore = await employeeDashboardPage.getEmployeeCount();

        await employeeDashboardPage.addEmployee(firstName, lastName, dependants);

        const newEmployeeId = await employeeDashboardPage.getNewEmployeeId();
        await employeeDashboardPage.deleteEmployee(newEmployeeId);

        const rowsAfter = await employeeDashboardPage.getEmployeeCount();

        expect(rowsAfter).toBe(rowsBefore);
    });

    test('Verify actual net pay = expected net pay', async () => {
        const firstName = 'Playwright';
        const lastName = 'NetPay';
        const dependants = employee.dependants;

        await employeeDashboardPage.addEmployee(firstName, lastName, dependants);

        const newEmployeeId = await employeeDashboardPage.getNewEmployeeId();
        const expectedNetPay = await employeeDashboardPage.getExpectedNetPay();

        const actualNetPay = await employeeDashboardPage.getEmployeeNetPayById(newEmployeeId);
        expect(actualNetPay).toBeCloseTo(expectedNetPay);
    });
});
