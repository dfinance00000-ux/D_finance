const Loan = require('../models/Loan');

// Advisor jab Field Verification & KYC submit karega
exports.verifyField = async (req, res) => {
    try {
        // 1. Saara data req.body se extract karna
        const { 
            loanId, 
            religion, 
            category, 
            houseType, 
            areaType,
            residenceNature,
            monthlyIncome, 
            familyExpenditure,
            memberOccupation,
            incomeActivity,
            yearsAtCurrentAddress,
            // Naye Audit Fields (Add kiye gaye hain)
            noOfMembers,
            earningMembers,
            noOfRooms,
            houseStay,
            drinkingWater,
            landAcres,
            networth,
            cows,
            // Nominee Details
            nomineeName,
            nomineeMobile,
            nomineeUID,
            nomineeRelation,
            nomineeAge,
            nomineePic,
            // KYC Documents (Base64 Strings)
            custLivePhoto,
            aadhaarFront,
            aadhaarBack,
            secondaryIdFront,
            secondaryIdBack,
            memberSignature,
            passbookPic,
            // System Fields
            locationName,
            verifiedByName,
            advisorId
        } = req.body;

        // 2. Database mein loan find karke update karna
        const updatedLoan = await Loan.findOneAndUpdate(
            { loanId: loanId }, // Loan ID se search
            { 
                $set: {
                    status: 'Field Verified', // Status change taaki Accountant ko dikhe
                    religion,
                    category,
                    houseType,
                    areaType,
                    residenceNature,
                    monthlyIncome,
                    familyExpenditure,
                    memberOccupation,
                    incomeActivity,
                    yearsAtCurrentAddress,
                    // Save New Audit Fields
                    noOfMembers,
                    earningMembers,
                    noOfRooms,
                    houseStay,
                    drinkingWater,
                    landAcres,
                    networth,
                    cows,
                    // Nominee Data Save
                    nomineeName,
                    nomineeMobile,
                    nomineeUID,
                    nomineeRelation,
                    nomineeAge,
                    nomineePic,
                    // KYC Data Save
                    custLivePhoto,
                    custAadhaarFront: aadhaarFront,
                    custAadhaarBack: aadhaarBack,
                    secondaryIdFront,
                    secondaryIdBack,
                    custSignature: memberSignature,
                    passbookPic,
                    // Inspection Info
                    locationName,
                    verifiedByName,
                    advisorId: advisorId || req.user?.id, // Advisor ki ID attach karna
                    inspectionDate: new Date()
                }
            },
            { new: true, runValidators: true } // New data return karega
        );

        if (!updatedLoan) {
            return res.status(404).json({ success: false, error: "Loan Record Not Found!" });
        }

        console.log(`✅ Loan ${loanId} audit finalized by ${verifiedByName}`);

        res.status(200).json({ 
            success: true,
            message: "Field Verification & KYC Sync Successful!", 
            data: updatedLoan 
        });

    } catch (err) {
        console.error("❌ Verification Error:", err);
        res.status(500).json({ 
            success: false,
            error: "Verification Sync Failed", 
            details: err.message 
        });
    }
};