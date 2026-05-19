describe("AuthSphere login flow", () => {
  it("logs in and opens the IAM dashboard", () => {
    cy.visit("/login");

    cy.contains("Admin Login").should("be.visible");

    cy.get('input[placeholder="admin"]').clear().type("admin");
    cy.get('input[placeholder="Admin@12345"]').clear().type("Admin@12345");

    cy.contains("button", "Sign in").click();

    cy.url().should("include", "/dashboard");
    cy.contains("IAM Overview").should("be.visible");
    cy.contains("Secure IAM Admin Console").should("be.visible");
    cy.contains("Users").should("be.visible");
    cy.contains("Roles").should("be.visible");
  });
});
