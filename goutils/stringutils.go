package main

import (
	"fmt"
	"strings"
	"bytes"
	"strconv"
)

func main() {
	
	var a = []int64 {1,2,3,4,5}
	
	x := arry2string(a)
	fmt.Println(x)
	
	y := string2int64array(x)
	fmt.Println(y)
}


func arry2string( values[]int64) (string) {

	var buffer bytes.Buffer
	
	buffer.WriteString(",")
	
	for _,element := range values {
	  buffer.WriteString(strconv. FormatInt(element,10))
	  buffer.WriteString(",")
	}
	return buffer.String()
}

func string2int64array (str string) ([]int64) {

	var output = []int64{}

	input := strings.Split(str,",")
	input = input[1:len(input)-1]

	for _, i := range input {
		j, _ := strconv.ParseInt(i, 10, 64)
		output = append(output,j)
	}
	return output
}
