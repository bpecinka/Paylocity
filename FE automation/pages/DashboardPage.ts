import { Page, Locator } from '@playwright/test';

export class EmployeeDashboardPage {
    private page: Page;
    private addEmployeeButton: Locator;
    private employeeTable: Locator;
    private firstNameInput: Locator;
    private lastNameInput: Locator;
    private dependantsInput: Locator;
    private addEmployeeModalButton: Locator;
    private updateEmployeeButton: Locator;
    private deleteEmployeeButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.employeeTable = page.locator('#employeesTable');
        this.addEmployeeButton = page.locator('#add');
        this.firstNameInput = page.locator('#firstName');
        this.lastNameInput = page.locator('#lastName');
        this.dependantsInput = page.locator('#dependants');
        this.addEmployeeModalButton = page.locator('#addEmployee');
        this.updateEmployeeButton = page.locator('#updateEmployee');
        this.deleteEmployeeButton = page.locator('#deleteEmployee');
    }

    private dependants: number = 2;
    private employeeGrossPay: number = 2000;
    private employeeDeduction: number = 1000;
    private dependantDeduction: number = 500;
    private numberOfPaychecks: number = 26;

    private async fillInput(locator: Locator, value: string) {
        await locator.waitFor({state: 'visible'});
        await locator.fill(value);
    }

    public async addEmployee(firstName: string, lastName: string, dependants: number) {
        await this.addEmployeeButton.waitFor({state: 'visible'});

        await this.page.evaluate(() => {
            const element = document.querySelector('#add');
            if (element) {
                element.scrollIntoView({behavior: 'smooth', block: 'center'});
            }
        });

        await this.employeeTable.locator('tbody tr').first().waitFor({state: 'attached'});

        await this.addEmployeeButton.click();

        const employeeModal = this.page.locator('#employeeModal');
        await employeeModal.waitFor({state: 'visible'});

        await this.firstNameInput.waitFor({state: 'visible'});
        await this.lastNameInput.waitFor({state: 'visible'});
        await this.dependantsInput.waitFor({state: 'visible'});
        await this.addEmployeeModalButton.waitFor({state: 'visible'});

        await this.fillInput(this.firstNameInput, firstName);
        await this.fillInput(this.lastNameInput, lastName);
        await this.fillInput(this.dependantsInput, dependants.toString());

        await this.addEmployeeModalButton.click();
    }

    public getEmployeeTable(): Locator {
        return this.employeeTable;
    }

    public getEmployeeRows(): Locator {
        return this.employeeTable.locator('tbody tr');
    }


    public async getEmployeeCount(): Promise<number> {
        await this.employeeTable.locator('tbody tr').first().waitFor({state: 'visible'});
        const rows = this.employeeTable.locator('tbody tr');
        return rows.count();
    }

    public async editEmployee(id: string, firstName: string, lastName: string, dependants: number) {
        const editButton = this.employeeTable.locator(`tr:has(td:nth-child(1):text("${id}")) .fa-edit`);

        const editButtonCount = await editButton.count();
        if (editButtonCount === 1) {
            await editButton.click();
        } else {
            throw new Error(`Expected 1 edit button, but found ${editButtonCount}`);
        }

        const employeeModal = this.page.locator('#employeeModal');
        await employeeModal.waitFor({state: 'visible'});

        await this.fillInput(this.firstNameInput, firstName);
        await this.fillInput(this.lastNameInput, lastName);
        await this.fillInput(this.dependantsInput, dependants.toString());

        await this.updateEmployeeButton.click();
    }

    public async getNewEmployeeId(): Promise<string> {
        const employeeRow = this.employeeTable.locator('tbody tr').last();
        const employeeId = await employeeRow.locator('td:nth-child(1)').innerText();
        return employeeId.trim();
    }


    public async deleteEmployee(id: string) {
        const deleteButton = this.employeeTable.locator(`tr:has(td:text("${id}")) .fa-times`);
        await deleteButton.click();

        const deleteModal = this.page.locator('#deleteModal');
        await deleteModal.waitFor({state: 'visible'});

        await this.deleteEmployeeButton.click();
    }

    public async getExpectedNetPay(): Promise<number> {
        return this.employeeGrossPay - ((this.employeeDeduction / this.numberOfPaychecks) + (this.dependants * this.dependantDeduction / this.numberOfPaychecks));
    }

    public async getEmployeeNetPayById(employeeId: string): Promise<number> {
        const employeeRow = this.employeeTable.locator(`tbody tr:has(td:has-text("${employeeId}"))`);

        await employeeRow.waitFor({state: 'attached'});

        const netPayText = await employeeRow.locator('td:nth-child(8)').innerText();
        const netPay = parseFloat(netPayText.replace('$', '').trim());

        return netPay;
    }

}
