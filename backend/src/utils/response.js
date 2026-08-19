export function successResponse(data) {
  return {
    success: true,
    data,
  };
}

export function createdResponse(data) {
  return {
    success: true,
    data,
  };
}

export function listResponse(data, meta) {
  const response = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = {
      page: meta.page || 1,
      limit: meta.limit || 20,
      total: meta.total || 0,
      totalPages: meta.totalPages || Math.ceil((meta.total || 0) / (meta.limit || 20)),
    };
  }

  return response;
}

export function errorResponse(code, message) {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}

export function paginatedMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
