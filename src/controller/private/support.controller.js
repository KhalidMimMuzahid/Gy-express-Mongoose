const SupportTicket = require("../../models/supportTicket.model");

const getAllSupportHistory = async (_req, res) => {
    try {
      const allSupportTickets = await SupportTicket.find({});
      if (allSupportTickets.length > 0) {
        return res.status(200).json({data: allSupportTickets});
      } else {
        return res.status(400).json({
          message: "No support tickets found",
        });
      }
    } catch (error) {
      return res.status(400).json({
        message: "Something went wrong",
      });
    }
  };
  

module.exports = getAllSupportHistory;
