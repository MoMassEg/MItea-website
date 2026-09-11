'use server';

import {
  SubmitCateringRequestSchema,
  SubmitCateringRequestInput,
} from '@/lib/validators/catering';
import {
  createCateringRequest,
  getCateringRequest,
  getUserCateringRequests,
} from '@/lib/catering-service';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function submitCateringRequest(input: SubmitCateringRequestInput) {
  try {
    const validated = SubmitCateringRequestSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || 'Invalid catering request data',
      };
    }

    const user = await getCurrentUser();
    const result = await createCateringRequest(validated.data, user?.id);

    return {
      success: true,
      request: result,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to submit catering request',
    };
  }
}

export async function getCateringRequestAction(idOrNumber: string) {
  try {
    const result = await getCateringRequest(idOrNumber);
    if (!result) {
      return {
        success: false,
        error: 'Catering request not found',
      };
    }
    return {
      success: true,
      request: result,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to fetch catering request',
    };
  }
}

export async function getUserCateringRequestsAction() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const requests = await getUserCateringRequests(user.id);
    return {
      success: true,
      requests,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to fetch user catering requests',
    };
  }
}
