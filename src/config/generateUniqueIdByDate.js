const userIDGenerator = ()=> {
  let lastUsedNumber = 1;
  
    try {
      const today = new Date();
    const todayStr = `AB${today.getDate().toString().padStart(2, "0")}${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}${today.getFullYear()}`;

    const userID = `${todayStr}${lastUsedNumber.toString().padStart(4, "0")}`;
    //   lastUsedNumber++; // Increment the number for the next call
    return userID;
    } catch (error) {
      console.log(error)
    }
  
};

const generateUniqueIdByDate = (lastUser) => {
  const today = new Date();
  const todayStr = `AB${today.getDate().toString().padStart(2, "0")}${(
    today.getMonth() + 1
  ).toString().padStart(2, "0")}${today.getFullYear()}`;
    const lastUserID = lastUser?.userId;
    const check= lastUserID?.substring(lastUserID?.length - 4) 

 const admin = lastUser?.userId?.toLowerCase();
    if( admin =="admin") {
      const newID=userIDGenerator();
      return newID;
    }
    else if ( !lastUser ) {
      const newID=userIDGenerator();
      return newID;
    }   
    
    else if ( check == "9999" ) {
    const newID=userIDGenerator();
    return newID;
  } 
  
  else {
    const lastUsedNumber = Number(check);
    console.log({lastUsedNumber})
    const newUserID = `${todayStr}${(lastUsedNumber + 1)
      ?.toString()
      .padStart(4, "0")}`;
      console.log({newUserID})
    return newUserID;
  }
};

module.exports = generateUniqueIdByDate;
