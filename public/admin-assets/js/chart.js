// Fetch sales report data from the server
fetch("/admin/salesReport")
  .then((response) => response.json())
  .then((data) => {
    const ctx = document.getElementById("chart-1").getContext("2d");
    const myChart = new Chart(ctx, {
      type: "polarArea",
      data: {
        labels: data.productNames,
        datasets: [
          {
            label: "Top Selling Products",
            data: data.productQuantities,
            backgroundColor: [
              'rgba(255, 99, 132, 1)', // Red
              'rgba(54, 162, 235, 1)', // Blue
              'rgba(255, 206, 86, 1)', // Yellow
              'rgba(75, 192, 192, 1)', // Teal
              'rgba(153, 102, 255, 1)', // Purple
              'rgba(255, 159, 64, 1)', // Orange
              'rgba(100, 200, 50, 1)', // Lime Green
              'rgba(200, 50, 150, 1)', // Pink
              'rgba(50, 150, 200, 1)', // Light Blue
              'rgba(120, 180, 80, 1)', // Olive Green
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)', // Red
              'rgba(54, 162, 235, 1)', // Blue
              'rgba(255, 206, 86, 1)', // Yellow
              'rgba(75, 192, 192, 1)', // Teal
              'rgba(153, 102, 255, 1)', // Purple
              'rgba(255, 159, 64, 1)', // Orange
              'rgba(100, 200, 50, 1)', // Lime Green
              'rgba(200, 50, 150, 1)', // Pink
              'rgba(50, 150, 200, 1>', // Light Blue
              'rgba(120, 180, 80, 1)' // Olive Green
          ],
          borderWidth: 1
          },
        ],
      },
      options: {
        responsive: true,
      },
    });
  })
  .catch((error) => {
    console.log("Error fetching sales report data:", error);
  });

// Fetch sales report data from the server
fetch("/admin/salesReport/lineGraph")
  .then((response) => response.json())
  .then((data) => {
    /*
    const productCategories = data.productCategories;
    const categoryNames = data.categoryNames;
    const products=data.products

    const categoryRevenueMap = {};

    // Calculate total revenue per category
    Object.keys(productCategories).forEach((productId) => {
      const categoryId = productCategories[productId].categoryId;
      const productName = productCategories[productId].productName;
      const order = data.orders.find((order) =>
        order.cartItems.some((item) => item.product === productId)
      );

      if (order) {
        const productPrice = order.cartItems.find(
          (item) => item.product === productId
        ).price;
        const revenue =
          productPrice *
          order.cartItems.find((item) => item.product === productId).quantity;

        if (!categoryRevenueMap[categoryId]) {
          categoryRevenueMap[categoryId] = {
            categoryName: categoryNames[categoryId],
            totalRevenue: revenue,
            products: [{ productName, revenue }],
          };
        } else {
          categoryRevenueMap[categoryId].totalRevenue += revenue;
          categoryRevenueMap[categoryId].products.push({
            productName,
            revenue,
          });
        }
      }
    });*/

    const ctx2 = document.getElementById("chart-2").getContext("2d");
    const myChart2 = new Chart(ctx2, {
      type: "bar",
      data: {
        labels:  data.productNames,
        datasets: [
          {
            label: "Products",
            data: data.productStock,
            backgroundColor: [
              
              'rgba(54, 162, 235, 1)', // Blue
              'rgba(255, 99, 132, 1)', // Red
              'rgba(255, 206, 86, 1)', // Yellow
              'rgba(75, 192, 192, 1)', // Teal
              'rgba(153, 102, 255, 1)', // Purple
              'rgba(255, 159, 64, 1)', // Orange
              'rgba(100, 200, 50, 1)', // Lime Green
              'rgba(200, 50, 150, 1)', // Pink
              'rgba(50, 150, 200, 1)', // Light Blue
              'rgba(120, 180, 80, 1)', // Olive Green
          ],
          borderColor: [
              
              'rgba(54, 162, 235, 1)', // Blue
              'rgba(255, 99, 132, 1)', // Red
              'rgba(255, 206, 86, 1)', // Yellow
              'rgba(75, 192, 192, 1)', // Teal
              'rgba(153, 102, 255, 1)', // Purple
              'rgba(255, 159, 64, 1)', // Orange
              'rgba(100, 200, 50, 1)', // Lime Green
              'rgba(200, 50, 150, 1)', // Pink
              'rgba(50, 150, 200, 1>', // Light Blue
              'rgba(120, 180, 80, 1)' // Olive Green
          ],
          borderWidth: 1
      }]
  },
      options: {
        responsive: true,
      },
    });
  })
  .catch((error) => {
    console.log("Error fetching sales report data:", error);
  });