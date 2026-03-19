const mongoose = require('mongoose');
const { ReceiptPurchaseDetail, SparePart, AssetModel, StockMoveLine } = require('../../models');
// lấy danh sách spareParts vs số lượng trong kho
const querySpareParts = async (filter, options) => {
  const spareParts = await SparePart.paginate(filter, {
    ...options,
    populate: [
      { path: "spareCategoryId", select: "spareCategoryName" },
      { path: "spareSubCategoryId", select: "spareSubCategoryName" },
      // { path: "manufacturer"},
    ],
  });

  const sparePartIds = spareParts.results.map(sp => sp._id);

  const stockInfo = await ReceiptPurchaseDetail.aggregate([
    {
      $match: {
        item: { $in: sparePartIds },
        itemType: 'SpareParts',
      },
    },
    {
      $lookup: {
        from: 'receiptpurchases',
        localField: 'receiptPurchase',
        foreignField: '_id',
        as: 'purchase',
      },
    },
    { $unwind: '$purchase' },
    { $match: { 'purchase.action': 'approved' } },
    {
      $group: {
        _id: '$item',
        totalImportQty: { $sum: '$qty' },
      },
    },
    {
      $lookup: {
        from: 'receiptissuedetails',
        let: { itemId: '$_id' },
        pipeline: [
          {
            $lookup: {
              from: 'receiptissues',
              localField: 'receiptIssue',
              foreignField: '_id',
              as: 'issue',
            },
          },
          { $unwind: '$issue' },
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$item', '$$itemId'] },
                  { $eq: ['$itemType', 'SpareParts'] },
                  { $eq: ['$issue.action', 'approved'] },

                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalExportQty: { $sum: '$qty' },
            },
          },
        ],
        as: 'exportData',
      },
    },
    {
      $lookup: {
        from: 'returntosupplierdetails',
        let: { itemId: '$_id' },
        pipeline: [
          {
            $lookup: {
              from: 'returntosuppliers',
              localField: 'returnToSupplier',
              foreignField: '_id',
              as: 'returnDoc',
            },
          },
          { $unwind: '$returnDoc' },
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$item', '$$itemId'] },
                  { $eq: ['$itemType', 'SpareParts'] },
                  { $eq: ['$returnDoc.action', 'approved'] },

                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalReturnQty: { $sum: '$qty' },
            },
          },
        ],
        as: 'returnData',
      },
    },
    {
      $addFields: {
        totalExportQty: {
          $ifNull: [{ $arrayElemAt: ['$exportData.totalExportQty', 0] }, 0],
        },
        totalReturnQty: {
          $ifNull: [{ $arrayElemAt: ['$returnData.totalReturnQty', 0] }, 0],
        },
        stockQty: {
          $subtract: [
            '$totalImportQty',
            {
              $add: [
                { $ifNull: [{ $arrayElemAt: ['$exportData.totalExportQty', 0] }, 0] },
                { $ifNull: [{ $arrayElemAt: ['$returnData.totalReturnQty', 0] }, 0] },
              ],
            },
          ],
        },
      },
    },
    {
      $project: {
        _id: 1,
        stockQty: 1,
      },
    },
  ]);

  const stockMap = new Map(stockInfo.map(item => [item._id.toString(), item.stockQty]));

  spareParts.results = spareParts.results.map(sp => ({
    ...sp.toJSON(),
    qty: stockMap.get(sp._id.toString()) || 0,
  }));

  return spareParts;
};

// lấy danh sách assetModels vs số lượng trong kho
const queryAssetModels = async (filter, options) => {
  ['assetTypeCategory', 'supplier', 'category', 'manufacturer', 'subCategory', '_id', 'asset'].forEach((key) => {
    if (filter[key] && typeof filter[key] === 'string' && mongoose.Types.ObjectId.isValid(filter[key])) {
      // eslint-disable-next-line no-param-reassign
      filter[key] = mongoose.Types.ObjectId(filter[key]);
    }
  });
  const _populate = [{
    path: 'assetTypeCategory'
  },
  {
    path: 'category'
  },
  {
    path: 'manufacturer'
  },
  {
    path: 'subCategory'
  },
  {
    path: 'paramaters'
  },
  {
    path: 'supplier'
  },
  {
    path: 'asset'
  },];
  const assetModels = await AssetModel.paginate(filter, {
    ...options,
    populate: _populate,
  });

  const assetModelIds = assetModels.results.map(am => am._id);

  const stockInfo = await ReceiptPurchaseDetail.aggregate([
    {
      $match: {
        item: { $in: assetModelIds },
        itemType: 'AssetModel',
      },
    },
    {
      $lookup: {
        from: 'receiptpurchases',
        localField: 'receiptPurchase',
        foreignField: '_id',
        as: 'purchase',
      },
    },
    { $unwind: '$purchase' },
    { $match: { 'purchase.action': 'approved' } },
    {
      $group: {
        _id: '$item',
        totalImportQty: { $sum: '$qty' },
      },
    },
    {
      $lookup: {
        from: 'receiptissuedetails',
        let: { itemId: '$_id' },
        pipeline: [
          {
            $lookup: {
              from: 'receiptissues',
              localField: 'receiptIssue',
              foreignField: '_id',
              as: 'issue',
            },
          },
          { $unwind: '$issue' },
          {
            $match: {
              'issue.action': 'approved',
              itemType: 'AssetModel',
            },
          },
          {
            $match: {
              $expr: { $eq: ['$item', '$$itemId'] },
            },
          },
          {
            $group: {
              _id: null,
              totalExportQty: { $sum: '$qty' },
            },
          },
        ],
        as: 'exportData',
      },
    },
    {
      $lookup: {
        from: 'returntosupplierdetails',
        let: { itemId: '$_id' },
        pipeline: [
          {
            $lookup: {
              from: 'returntosuppliers',
              localField: 'returnToSupplier',
              foreignField: '_id',
              as: 'return',
            },
          },
          { $unwind: '$return' },
          {
            $match: {
              'return.action': 'approved',
              itemType: 'AssetModel',
            },
          },
          {
            $match: {
              $expr: { $eq: ['$item', '$$itemId'] },
            },
          },
          {
            $group: {
              _id: null,
              totalReturnQty: { $sum: '$qty' },
            },
          },
        ],
        as: 'returnData',
      },
    },
    {
      $addFields: {
        totalExportQty: {
          $ifNull: [{ $arrayElemAt: ['$exportData.totalExportQty', 0] }, 0],
        },
        totalReturnQty: {
          $ifNull: [{ $arrayElemAt: ['$returnData.totalReturnQty', 0] }, 0],
        },
        stockQty: {
          $subtract: [
            '$totalImportQty',
            {
              $add: [
                { $ifNull: [{ $arrayElemAt: ['$exportData.totalExportQty', 0] }, 0] },
                { $ifNull: [{ $arrayElemAt: ['$returnData.totalReturnQty', 0] }, 0] },
              ],
            },
          ],
        },
      },
    },
    {
      $project: {
        _id: 1,
        stockQty: 1,
      },
    },
  ]);

  const stockMap = new Map(stockInfo.map(item => [item._id.toString(), item.stockQty]));

  assetModels.results = assetModels.results.map(am => ({
    ...am.toJSON(),
    qty: stockMap.get(am.id.toString()) || 0,
  }));

  return assetModels;
};

// lấy ra số luợng sparePart theo id
const getSparePartQtyById = async (id) => {
  const sparePartId = id;

  const stockInfo = await ReceiptPurchaseDetail.aggregate([
    {
      $match: {
        item: sparePartId,
        itemType: 'SpareParts',
      },
    },
    {
      $lookup: {
        from: 'receiptpurchases',
        localField: 'receiptPurchase',
        foreignField: '_id',
        as: 'purchase',
      },
    },
    { $unwind: '$purchase' },
    { $match: { 'purchase.action': 'approved' } },
    {
      $group: {
        _id: '$item',
        totalImportQty: { $sum: '$qty' },
      },
    },
    {
      $lookup: {
        from: 'receiptissuedetails',
        let: { itemId: '$_id' },
        pipeline: [
          {
            $lookup: {
              from: 'receiptissues',
              localField: 'receiptIssue',
              foreignField: '_id',
              as: 'issue',
            },
          },
          { $unwind: '$issue' },
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$item', '$$itemId'] },
                  { $eq: ['$itemType', 'SpareParts'] },
                  { $eq: ['$issue.action', 'approved'] },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalExportQty: { $sum: '$qty' },
            },
          },
        ],
        as: 'exportData',
      },
    },
    {
      $lookup: {
        from: 'returntosupplierdetails',
        let: { itemId: '$_id' },
        pipeline: [
          {
            $lookup: {
              from: 'returntosuppliers',
              localField: 'returnToSupplier',
              foreignField: '_id',
              as: 'returnDoc',
            },
          },
          { $unwind: '$returnDoc' },
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$item', '$$itemId'] },
                  { $eq: ['$itemType', 'SpareParts'] },
                  { $eq: ['$returnDoc.action', 'approved'] },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalReturnQty: { $sum: '$qty' },
            },
          },
        ],
        as: 'returnData',
      },
    },
    {
      $addFields: {
        totalExportQty: {
          $ifNull: [{ $arrayElemAt: ['$exportData.totalExportQty', 0] }, 0],
        },
        totalReturnQty: {
          $ifNull: [{ $arrayElemAt: ['$returnData.totalReturnQty', 0] }, 0],
        },
        stockQty: {
          $subtract: [
            '$totalImportQty',
            {
              $add: [
                { $ifNull: [{ $arrayElemAt: ['$exportData.totalExportQty', 0] }, 0] },
                { $ifNull: [{ $arrayElemAt: ['$returnData.totalReturnQty', 0] }, 0] },
              ],
            },
          ],
        },
      },
    },
    {
      $project: {
        _id: 1,
        stockQty: 1,
      },
    },
  ]);

  if (stockInfo.length === 0) return 0;

  return stockInfo[0].stockQty;
};

// lấy ra số luợng assetModel theo id
const getAssetModelQtyById = async (id) => {
  const assetModelId = id;

  const stockInfo = await ReceiptPurchaseDetail.aggregate([
    {
      $match: {
        item: assetModelId,
        itemType: 'AssetModel',
      },
    },
    {
      $lookup: {
        from: 'receiptpurchases',
        localField: 'receiptPurchase',
        foreignField: '_id',
        as: 'purchase',
      },
    },
    { $unwind: '$purchase' },
    { $match: { 'purchase.action': 'approved' } },
    {
      $group: {
        _id: '$item',
        totalImportQty: { $sum: '$qty' },
      },
    },
    {
      $lookup: {
        from: 'receiptissuedetails',
        let: { itemId: '$_id' },
        pipeline: [
          {
            $lookup: {
              from: 'receiptissues',
              localField: 'receiptIssue',
              foreignField: '_id',
              as: 'issue',
            },
          },
          { $unwind: '$issue' },
          {
            $match: {
              'issue.action': 'approved',
              itemType: 'AssetModel',
            },
          },
          {
            $match: {
              $expr: { $eq: ['$item', '$$itemId'] },
            },
          },
          {
            $group: {
              _id: null,
              totalExportQty: { $sum: '$qty' },
            },
          },
        ],
        as: 'exportData',
      },
    },
    {
      $lookup: {
        from: 'returntosupplierdetails',
        let: { itemId: '$_id' },
        pipeline: [
          {
            $lookup: {
              from: 'returntosuppliers',
              localField: 'returnToSupplier',
              foreignField: '_id',
              as: 'return',
            },
          },
          { $unwind: '$return' },
          {
            $match: {
              'return.action': 'approved',
              itemType: 'AssetModel',
            },
          },
          {
            $match: {
              $expr: { $eq: ['$item', '$$itemId'] },
            },
          },
          {
            $group: {
              _id: null,
              totalReturnQty: { $sum: '$qty' },
            },
          },
        ],
        as: 'returnData',
      },
    },
    {
      $addFields: {
        totalExportQty: {
          $ifNull: [{ $arrayElemAt: ['$exportData.totalExportQty', 0] }, 0],
        },
        totalReturnQty: {
          $ifNull: [{ $arrayElemAt: ['$returnData.totalReturnQty', 0] }, 0],
        },
        stockQty: {
          $subtract: [
            '$totalImportQty',
            {
              $add: [
                { $ifNull: [{ $arrayElemAt: ['$exportData.totalExportQty', 0] }, 0] },
                { $ifNull: [{ $arrayElemAt: ['$returnData.totalReturnQty', 0] }, 0] },
              ],
            },
          ],
        },
      },
    },
    {
      $project: {
        _id: 1,
        stockQty: 1,
      },
    },
  ]);

  if (stockInfo.length === 0) return 0;

  return stockInfo[0].stockQty;
};

const getInventorySparePart = async (filter, options) => {
  const matchStage = {
    $match: {
      spareParts: { $ne: null },
    },
  };

  // nếu có tìm kiếm theo id sparePart
  if (filter.sparePartId) {
    matchStage.$match.spareParts = new mongoose.Types.ObjectId(filter.sparePartId);
  }

  const pipeline = [
    matchStage,
    {
      $group: {
        _id: '$spareParts',
        importQty: {
          $sum: {
            $cond: [{ $ifNull: ['$stockReceipt', false] }, '$productDoneQty', 0],
          },
        },
        exportQty: {
          $sum: {
            $cond: [{ $ifNull: ['$stockIssue', false] }, '$productDoneQty', 0],
          },
        },
        stockMoveLine: { $push: '$$ROOT' },
      },
    },
    {
      $addFields: {
        totalQty: { $subtract: ['$importQty', '$exportQty'] },
      },
    },
    {
      $lookup: {
        from: 'spareparts',
        localField: '_id',
        foreignField: '_id',
        as: 'sparePartInfo',
      },
    },
    { $unwind: '$sparePartInfo' },
    {
      $lookup: {
        from: 'uoms',
        localField: 'sparePartInfo.uomId',
        foreignField: '_id',
        as: 'uom',
      },
    },
    { $unwind: { path: '$uom', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        sparePartId: '$_id',
        sparePartInfo: 1,
        uom: 1,
        importQty: 1,
        exportQty: 1,
        totalQty: 1,
        stockMoveLine: 1,
      },
    },

    { $skip: (parseInt(options.page) - 1) * parseInt(options.limit) },
    { $limit: parseInt(options.limit) },

    {
      $facet: {
        data: [
          {
            $project: {
              _id: 0,
              sparePartId: '$_id',
              sparePartInfo: 1,
              uom: 1,
              importQty: 1,
              exportQty: 1,
              totalQty: 1,
              stockMoveLine: 1,
            },
          },
          { $skip: (parseInt(options.page) - 1) * parseInt(options.limit) },
          { $limit: parseInt(options.limit) },
        ],
        totalCount: [
          { $count: 'count' }
        ],
      },
    }
  ]

  const result = await StockMoveLine.aggregate(pipeline);

  const totalResults = result[0].totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalResults / parseInt(options.limit));
  return { results: result[0].data, totalResults, totalPages, page: parseInt(options.page), limit: parseInt(options.limit) };

}


const getInventoryAssetModel = async (filter, options) => {
  const matchStage = {
    $match: {
      assetModel: { $ne: null },
    },
  };

  // nếu có tìm kiếm theo id assetModel
  if (filter.assetModelId) {
    matchStage.$match.assetModel = new mongoose.Types.ObjectId(filter.assetModelId);
  }

  const pipeline = [
    matchStage,
    {
      $group: {
        _id: '$assetModel',
        importQty: {
          $sum: {
            $cond: [{ $ifNull: ['$stockReceipt', false] }, '$productDoneQty', 0],
          },
        },
        exportQty: {
          $sum: {
            $cond: [{ $ifNull: ['$stockIssue', false] }, '$productDoneQty', 0],
          },
        },
        stockMoveLine: { $push: '$$ROOT' },
      },
    },
    {
      $addFields: {
        totalQty: { $subtract: ['$importQty', '$exportQty'] },
      },
    },
    {
      $lookup: {
        from: 'assetmodels',
        localField: '_id',
        foreignField: '_id',
        as: 'assetModelInfo',
      },
    },
    { $unwind: '$assetModelInfo' },
    {
      $lookup: {
        from: 'assets',
        localField: 'assetModelInfo.asset',
        foreignField: '_id',
        as: 'asset',
      },
    },
    { $unwind: '$asset' },
  ]
  // Nếu có filter.assetName thì match ngay sau unwind asset
  if (filter.assetName) {
    pipeline.push({
      $match: {
        "asset.assetName": { $regex: filter.assetName, $options: "i" }
      }
    });
  }

  // Thêm $facet để vừa phân trang vừa lấy total
  pipeline.push({
    $facet: {
      data: [
        {
          $project: {
            _id: 0,
            assetModelId: '$_id',
            assetModelInfo: 1,
            asset: 1,
            importQty: 1,
            exportQty: 1,
            totalQty: 1,
            stockMoveLine: 1,
          },
        },
        { $skip: (parseInt(options.page) - 1) * parseInt(options.limit) },
        { $limit: parseInt(options.limit) },
      ],
      totalCount: [
        { $count: 'count' } // đếm tổng document sau group và match
      ],
    },
  });

  const result = await StockMoveLine.aggregate(pipeline)
  const totalResults = result[0].totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalResults / parseInt(options.limit));
  return { results: result[0].data, totalResults, totalPages, page: parseInt(options.page), limit: parseInt(options.limit) };
};


module.exports = {
  querySpareParts,
  queryAssetModels,
  getSparePartQtyById,
  getAssetModelQtyById,
  getInventorySparePart,
  getInventoryAssetModel,
};
