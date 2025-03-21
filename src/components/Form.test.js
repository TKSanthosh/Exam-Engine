// Form.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Form from './Form'; // Adjust the import path based on your project structure

describe('Form component', () => {
  test('renders form correctly', () => {
    const { getByLabelText, getByText } = render(<Form />);
    
    expect(getByLabelText(/Name/i)).toBeInTheDocument();
    expect(getByLabelText(/Email/i)).toBeInTheDocument();
    expect(getByLabelText(/Password/i)).toBeInTheDocument();
    expect(getByLabelText(/Select Subject Code/i)).toBeInTheDocument();
    expect(getByLabelText(/Exam Date/i)).toBeInTheDocument();
    expect(getByText(/Submit/i)).toBeInTheDocument();
  });

  test('updates form data on input change', () => {
    const { getByLabelText } = render(<Form />);
    
    fireEvent.change(getByLabelText(/Name/i), { target: { value: 'John' } });
    fireEvent.change(getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    expect(getByLabelText(/Name/i).value).toBe('John');
    expect(getByLabelText(/Email/i).value).toBe('john@example.com');
    expect(getByLabelText(/Password/i).value).toBe('password123');
  });

  // Add more test cases for other functionalities like subject code selection, exam date update, form submission, etc.
});
