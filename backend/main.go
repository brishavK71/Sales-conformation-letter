package main

import (
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nguyenthenguyen/docx"
)

type LetterData struct {
	ReceiverName   string `json:"receiver_name"`
	ReceiverAddr   string `json:"receiver_addr"`
	PAN            string `json:"pan"`
	Date           string `json:"date"`
	OpeningBalance string `json:"opening_balance"`
	TotalSales     string `json:"total_sales"`
	ClosingBalance string `json:"closing_balance"`
	ReceiverSig    string `json:"receiver_signature"`
}

func main() {
	r := gin.Default()

	r.POST("/generate", func(c *gin.Context) {
		var data LetterData
		if err := c.BindJSON(&data); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		r, err := docx.ReadDocxFile("template.docx")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Template read error"})
			return
		}
		doc := r.Editable()

		doc.Replace("{{receiver_name}}", data.ReceiverName, -1)
		doc.Replace("{{receiver_addr}}", data.ReceiverAddr, -1)
		doc.Replace("{{pan}}", data.PAN, -1)
		doc.Replace("{{date}}", data.Date, -1)
		doc.Replace("{{opening_balance}}", data.OpeningBalance, -1)
		doc.Replace("{{total_sales}}", data.TotalSales, -1)
		doc.Replace("{{closing_balance}}", data.ClosingBalance, -1)
		doc.Replace("{{receiver_signature}}", data.ReceiverSig, -1)

		output := "output_" + time.Now().Format("20060102150405") + ".docx"
		doc.WriteToFile(output)

		c.FileAttachment(output, "Sales_Confirmation.docx")
		os.Remove(output)
	})

	r.Run(":8080")
}
