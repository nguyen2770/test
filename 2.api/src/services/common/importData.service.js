const path = require('path');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const XLSX = require("xlsx");
const fs = require("fs");
const ApiError = require('../../utils/ApiError');
const { Manufacturer, Category, SubCategory, Asset, Supplier, AssetModel, AssetTypeCategoryModel, AssetMaintenance, Customer, ResourceImportDataModel } = require('../../models');
const { assetTypeMap, yesNoMap } = require('../../utils/constant');
const resourceImportDataService = require('./resourceImportData.service');

// const excelDateToJSDate = (serial) => {
//     const utcDays = Math.floor(serial - 25569); // 25569 = 01/01/1970
//     const utcValue = utcDays * 86400;          // giây
//     return new Date(utcValue * 1000);
// }

// const uploadAssetMaintenanceExcel = async (filePath) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     // await AssetMaintenance.deleteMany({ assetNumber: { $in: [121, 120] } })
//     try {
//         const workbook = XLSX.readFile(filePath);
//         const sheet = workbook.Sheets[workbook.SheetNames[0]];
//         const jsonData = XLSX.utils.sheet_to_json(sheet);

//         const docs = [];

//         for (const row of jsonData) {
//             const stt = row.STT;
//             const manufacturerName = row["Hãng sản xuất"];
//             const categoryName = row["Danh mục"];
//             const subCategoryName = row["Danh mục con"];
//             const assetName = row["Tên tài sản"];
//             const supplierName = row["Nhà cung cấp"];
//             const assetModelName = row.Model;
//             const assetTypeCategoryName = row["Loại thiết bị"];
//             const assetStyle = assetTypeMap[row["Kiểu tài sản"]];
//             const customerName = row["Người sử dụng"];
//             const isMovable = yesNoMap[row["Thiết bị di động"]];
//             const description = row["Ghi chú"];
//             let installationDate = null;
//             if (row["Ngày cài đặt"]) {
//                 if (typeof row["Ngày cài đặt"] === "number") {
//                     // Excel serial number
//                     installationDate = excelDateToJSDate(row["Ngày cài đặt"]);
//                 } else {
//                     // Chuỗi "dd/MM/yyyy"
//                     const [day, month, year] = row["Ngày cài đặt"].split("/");
//                     installationDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
//                 }
//             }


//             // const payload = {
//             //     manufacturerName,
//             //     categoryName,
//             //     subCategoryName,
//             //     assetName,
//             //     supplierName,
//             //     assetModelName,
//             //     assetTypeCategoryName,
//             //     assetStyle,
//             //     customerName,
//             //     serial: row["Số seri"] || null,
//             //     assetNumber: row["Số tài sản"] || null,
//             //     yearOfManufacturing: row["Năm sản xuất"] || null,
//             //     installationDate,
//             //     isMovable,
//             //     description,
//             // }
//             // console.log(payload)
//             // // helper inline luôn
//             const findOrCreate = async (Model, query, doc) => {
//                 let record = await Model.findOne(query);
//                 if (!record) {
//                     const created = await Model.create([doc]);
//                     record = created[0];
//                 }
//                 return record._id; // chỉ trả về _id
//             };

//             const assetTypeCategory = assetTypeCategoryName
//                 ? await findOrCreate(AssetTypeCategoryModel, { name: assetTypeCategoryName }, { name: assetTypeCategoryName })
//                 : null;

//             const manufacturer = manufacturerName
//                 ? await findOrCreate(Manufacturer, { manufacturerName }, { manufacturerName })
//                 : null;

//             const category = categoryName
//                 ? await findOrCreate(Category, { categoryName }, { categoryName })
//                 : null;

//             const subCategory = subCategoryName && category
//                 ? await findOrCreate(SubCategory, { subCategoryName, categoryId: category }, { subCategoryName, categoryId: category })
//                 : null;

//             const asset = assetName
//                 ? await findOrCreate(Asset, { assetName }, { assetName })
//                 : null;

//             const supplier = supplierName
//                 ? await findOrCreate(Supplier, { supplierName }, { supplierName })
//                 : null;
//             const customer = customerName
//                 ? await findOrCreate(Customer, { customerName }, { customerName })
//                 : null;

//             const assetModel = asset && assetModelName && category
//                 ? await findOrCreate(
//                     AssetModel,
//                     { assetModelName, asset, category, supplier, subCategory, manufacturer, assetTypeCategory },
//                     { assetModelName, asset, category, supplier, subCategory, manufacturer, assetTypeCategory }
//                 )
//                 : null;

//             if (assetModel && assetStyle) {
//                 docs.push({
//                     assetModel,
//                     asset,
//                     assetStyle,
//                     serial: row["Số seri"] || null,
//                     assetNumber: row["Số tài sản"] || null,
//                     yearOfManufacturing: row["Năm sản xuất"] || null,
//                     installationDate,
//                     customer,
//                     isMovable,
//                     description,
//                 });
//             } else {
//                 console.log("❌ Bỏ qua dòng do thiếu dữ liệu dòng :", stt);
//                 return;
//             }
//         }

//         if (docs.length > 0) {
//             await AssetMaintenance.insertMany(docs);
//         }

//         await session.commitTransaction();
//         session.endSession();
//         return { success: true };
//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession();
//         throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
//     }
// };
const excelDateToJSDate = (serial) => {
    const utcDays = Math.floor(serial - 25569); // 25569 = 01/01/1970
    const utcValue = utcDays * 86400;          // giây
    return new Date(utcValue * 1000);
};

const uploadAssetMaintenanceExcel = async (filePath, file) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const uploadDir = path.join(__dirname, "../../../uploads");
        const fileName = path.parse(file.originalname).name; // Tên file gốc
        const extension = path.extname(file.originalname);   // Đuôi file gốc
        const fileNameExtension = fileName + extension;
        const _filePath = path.join(uploadDir, fileNameExtension); // Đường dẫn trong server
        const fileType = file.mimetype;
        const resourceImportData = await resourceImportDataService.createResourceImportData({
            fileName,
            filePath: _filePath,
            extension,
            fileType,
            createdDate: new Date(),
            sourceSave: "ASSETMAINTENANCE",
        }
            // , { session }
        );

        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        // await AssetMaintenance.deleteMany({ description: { $in: ['12', '21F2K1E2:P3E2:P3DA2:P3'] } })
        const docs = [];
        for (const row of jsonData) {
            const manufacturerName = row["Hãng sản xuất"];
            const categoryName = row["Danh mục"]
            const assetName = row["Tên tài sản"]
            const supplierName = row["Nhà cung cấp"]
            const customerName = row["Người sử dụng"]
            const nameAssetTypeCategory = row["Loại thiết bị"]
            const subCategoryName = row["Danh mục con"];
            const stt = row.STT;
            const assetModelName = row.Model;
            const assetStyle = assetTypeMap[row["Kiểu tài sản"]];

            let manufacturer = null
            if (manufacturerName) {
                const data = await Manufacturer.findOneAndUpdate(
                    { manufacturerName },
                    { $setOnInsert: { resourceImportData: resourceImportData._id, manufacturerName } },
                    { new: true, upsert: true, } // session
                );
                manufacturer = data._id;
            }

            let category = null
            if (categoryName) {
                const data = await Category.findOneAndUpdate(
                    { categoryName },
                    { $setOnInsert: { resourceImportData: resourceImportData._id, categoryName } },
                    { new: true, upsert: true, }
                );
                category = data._id;
            }

            let asset = null
            if (assetName) {
                const data = await Asset.findOneAndUpdate(
                    { assetName },
                    { $setOnInsert: { resourceImportData: resourceImportData._id, assetName } },
                    { new: true, upsert: true, }
                );
                asset = data._id;
            }

            let supplier = null
            if (supplierName) {
                const data = await Supplier.findOneAndUpdate(
                    { supplierName },
                    { $setOnInsert: { resourceImportData: resourceImportData._id, supplierName } },
                    { new: true, upsert: true, }
                );
                supplier = data._id
            }

            let customer = null
            if (customerName) {
                const data = await Customer.findOneAndUpdate(
                    { customerName },
                    { $setOnInsert: { resourceImportData: resourceImportData._id, customerName } },
                    { new: true, upsert: true, }
                );
                customer = data._id;
            }

            let assetTypeCategory = null
            if (nameAssetTypeCategory) {
                const data = await AssetTypeCategoryModel.findOneAndUpdate(
                    { name: nameAssetTypeCategory },
                    { $setOnInsert: { resourceImportData: resourceImportData._id, name: nameAssetTypeCategory } },
                    { new: true, upsert: true, }
                );
                assetTypeCategory = data._id;
            }

            let subCategory = null
            if (subCategoryName && category) {
                const data = await SubCategory.findOneAndUpdate(
                    { subCategoryName, categoryId: category },
                    { $setOnInsert: { resourceImportData: resourceImportData._id, subCategoryName, categoryId: category } },
                    { new: true, upsert: true, }
                );
                subCategory = data._id;
            }

            let assetModel = null;
            if (assetModelName && asset && category) {
                const data = await AssetModel.findOneAndUpdate(
                    {
                        assetModelName, category, asset, supplier,
                        subCategory, manufacturer, assetTypeCategory
                    },
                    {
                        $setOnInsert: {
                            assetModelName, category, asset, supplier,
                            subCategory, manufacturer, assetTypeCategory
                        }
                    },
                    { new: true, upsert: true, }
                );
                assetModel = data._id;
            }
            // ==== 3. Build docs ====
            let installationDate = null;
            if (row["Ngày cài đặt"]) {
                if (typeof row["Ngày cài đặt"] === "number") {
                    installationDate = excelDateToJSDate(row["Ngày cài đặt"]);
                } else {
                    const [day, month, year] = row["Ngày cài đặt"].split("/");
                    installationDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
                }
            }

            if (assetModel && assetStyle) {
                docs.push({
                    assetModel,
                    asset,
                    assetStyle,
                    serial: row["Số seri"] || null,
                    assetNumber: row["Số tài sản"] || null,
                    yearOfManufacturing: row["Năm sản xuất"] || null,
                    installationDate,
                    customer,
                    isMovable: yesNoMap[row["Thiết bị di động"]] || null,
                    description: row["Ghi chú"],
                    resourceImportData: resourceImportData._id,
                    assetModelName,
                    subCategoryName,
                    customerName,
                    assetName,
                    categoryName,
                    manufacturerName,

                });
            } else {
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    `❌ Lỗi ở dòng thứ ${stt}`
                );
            }
        }

        // ==== 4. Insert 1 lần ====
        if (docs.length > 0) {
            await AssetMaintenance.insertMany(docs);
        }
        // await session.abortTransaction();
        await session.commitTransaction();
        session.endSession();
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        fs.copyFileSync(filePath, _filePath);
        return { success: true };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};



module.exports = {
    uploadAssetMaintenanceExcel,
    // findOrCreate
};
