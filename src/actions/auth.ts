'use server';

import { createServerClient } from '@/lib/supabase/server';
import { signInSchema, signUpSchema, type SignInInput, type SignUpInput } from '@/lib/validators/auth';

export type AuthActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
};

/**
 * Server action to register a new user with email and password.
 */
export async function registerUser(input: SignUpInput): Promise<AuthActionResult> {
  try {
    const validated = signUpSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || 'Invalid registration details',
      };
    }

    const { email, password, name, phone } = validated.data;
    const supabase = await createServerClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name || '',
          name: name || '',
          phone: phone || '',
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Account created successfully!',
      data: {
        userId: data.user?.id,
        email: data.user?.email,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during registration',
    };
  }
}

/**
 * Server action to log in an existing user with email and password.
 */
export async function loginUser(input: SignInInput): Promise<AuthActionResult> {
  try {
    const validated = signInSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || 'Invalid login details',
      };
    }

    const { email, password } = validated.data;
    const supabase = await createServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Logged in successfully!',
      data: {
        userId: data.user?.id,
        email: data.user?.email,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during login',
    };
  }
}

/**
 * Server action to log out the current user session.
 */
export async function logoutUser(): Promise<AuthActionResult> {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Signed out successfully!',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during logout',
    };
  }
}
