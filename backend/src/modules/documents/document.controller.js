import * as documentService from '../../services/document.service.js';
import * as fileTypeService from '../../services/fileType.service.js';

export async function list(req, res, next) {
  try {
    const result = await documentService.listDocuments(req.query, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const doc = await documentService.getDocumentById(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const doc = await documentService.createDocument(req.body, {
      companyId: req.tenantId,
      userName: req.user?.fullName || req.user?.first_name || '',
    });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const doc = await documentService.updateDocument(req.params.id, req.body, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await documentService.deleteDocument(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function upload(req, res, next) {
  try {
    const result = await documentService.uploadDocuments(req.files, req.body, {
      companyId: req.tenantId,
      userName: req.user?.fullName || req.user?.first_name || '',
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function download(req, res, next) {
  try {
    const doc = await documentService.downloadDocument(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

export async function preview(req, res, next) {
  try {
    const doc = await documentService.previewDocument(req.params.id, {
      companyId: req.tenantId,
    });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

export async function stats(req, res, next) {
  try {
    const data = await documentService.getDocumentStatistics({
      companyId: req.tenantId,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listFileTypes(req, res, next) {
  try {
    const result = await fileTypeService.listFileTypes();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getFileTypeById(req, res, next) {
  try {
    const ft = await fileTypeService.getFileTypeById(req.params.id);
    res.json({ success: true, data: ft });
  } catch (err) {
    next(err);
  }
}

export async function createFileType(req, res, next) {
  try {
    const ft = await fileTypeService.createFileType(req.body);
    res.status(201).json({ success: true, data: ft });
  } catch (err) {
    next(err);
  }
}

export async function updateFileType(req, res, next) {
  try {
    const ft = await fileTypeService.updateFileType(req.params.id, req.body);
    res.json({ success: true, data: ft });
  } catch (err) {
    next(err);
  }
}

export async function deleteFileType(req, res, next) {
  try {
    const result = await fileTypeService.deleteFileType(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
