"use client";
import { Reporter, FullResult, TestCase, TestResult } from '@playwright/test/reporter';
// import axios from 'axios';

class EmailReporter implements Reporter {
  private passedTests: string[] = [];
  private failedTests: string[] = [];

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'passed') {
      this.passedTests.push(test.title);
    } else if (result.status === 'failed') {
      this.failedTests.push(test.title);
    }
}
  // async onEnd(result: FullResult) {
  //   // try {
  //   //   // Send email by calling the API route via axios
  //   //   // await axios.post('http://localhost:3000/api/send-test-report-email', {
  //   //   //   passedTests: this.passedTests,
  //   //   //   failedTests: this.failedTests,
  //   //   // });
  //   // } catch (error) {
  //   //   console.error('Failed to send email', error);
  //   // }
  // }
}

export default EmailReporter;