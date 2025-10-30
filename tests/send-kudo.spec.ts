import { test, expect } from "@playwright/test";

test("user login and send and view a kudo", async ({ page }) => {
   await page.goto("https://www.cheerchampion.com");

  //login in site
  await page.getByRole("link", { name: "Login" }).click();
  await expect(page).toHaveURL("https://www.cheerchampion.com/login");


  //fill the email and password
  await page.getByRole("textbox", { name: "Email Id" }).fill("cp@cheerchampion.com");
  await page.getByRole("button", { name: "Request OTP" }).click();
  await page.getByText("cp@cheerchampion.com").isVisible();
  await page.getByRole("textbox", { name: "OTP" }).isVisible();
  await page.getByRole("button", { name: "Login/Signup" }).isVisible();

  await page.waitForSelector('text=cp@cheerchampion.com', { state: 'visible' });
  await page.getByRole("textbox", { name: "OTP" }).click();
  await page.getByRole("textbox", { name: "OTP" }).fill("111111");
  await page.getByRole("button", { name: "Login/Signup" }).click();

  await expect(page).toHaveURL("https://www.cheerchampion.com");

  await page.waitForTimeout(2000);

  //send kudo-post
  await page.getByRole("textbox", { name: "E.g. Hey Jen! You were" }).isVisible();
  await page.getByRole("textbox", { name: "E.g. Hey Jen! You were" }).click();
  await page.getByRole("textbox", { name: "E.g. Hey Jen! You were" }).fill("test");
  await page.getByRole("button", { name: "Next >>" }).click();
  await expect(page).toHaveURL("https://www.cheerchampion.com/kudo/library");
  await page.locator(".giphy-gif").first().click();
  await expect(page).toHaveURL("https://www.cheerchampion.com/kudo/recipients");


  //select the recipient
await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
  await page.getByRole("img", { name: "Image" }).isVisible();

  await page.getByRole("textbox", { name: "Email Id" }).isVisible();
  await page.getByRole("button", { name: "Send" }).isVisible();
  await page.getByRole("textbox", { name: "Email Id" }).click();
  await page.getByRole("textbox", { name: "Email Id" }).fill("cp@cheerchampion.com");
  await page.getByRole("button", { name: "Send" }).click();

  await page.getByRole("link", { name: "Go To Feed" }).click();
  await expect(page).toHaveURL("https://www.cheerchampion.com/feeds");

  // await page.getByRole('button', { name: 'profile' }).click();
  // await page.getByRole('button', { name: 'Kudo feed' }).click();

  //view the kudo

  await page.locator('.bg-white > div > div').first().isVisible();
  // await page.locator('div').filter({ hasText: /^Youto test_Raj$/ }).nth(1).isVisible();
  // await page.getByRole('link', { name: 'You' }).first().isVisible();
  // await page.locator('span').filter({ hasText: 'test_Raj' }).getByRole('link').isVisible();

  await page.getByRole('button', { name: /Received/i }).click();

  // await page.locator('div').filter({ hasText: /^test_Rajto You$/ }).first().isVisible();
  // await page.getByRole('link', { name: 'test_Raj' }).isVisible();
  // await page.getByRole('link', { name: 'You' }).nth(1).isVisible();

  await page.getByRole('button', { name: /Given/i }).click();

  // await page.locator('div').filter({ hasText: /^Youto test_Raj$/ }).nth(1).isVisible();
  // await page.getByRole('link', { name: 'You' }).first().isVisible();
  // await page.locator('span').filter({ hasText: 'test_Raj' }).getByRole('link').isVisible();

  // await page.getByRole('button', { name: 'All' }).click();

  await page.getByRole('button', { name: /Given/i }).click();

  await  page.locator('div.col-span-1').first();


  await page.click('button img[alt="DropdownMenuIcon"]');
  await page.getByRole('button', { name:/Delete/i}).click();

  await page.getByRole('button', { name: /Delete/i }).click();
  //sign out
  await page.getByRole('button', { name: 'profile' }).click();
  await page.getByRole('button', { name: 'Sign out' }).click();
});
