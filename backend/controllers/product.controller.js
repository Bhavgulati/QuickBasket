export const getAllProducts = async (req, res) => {
  // Logic to get all products
  try{
    const products = await Product.find({});
    res.json({products});
  }catch(error){
    console.log("Error in Fetching Products",error.message);
    res.status(500).json({message:"Server error",error: error.message});
  }
}