function createGridHtml(grid) {
  const wrapper = $('<div class="grid-wrapper">');
  const gridCollapsed = $(
    '<div class="grid-collapsed-row flex gap-1 items-center">'
  ).appendTo(wrapper);
  const container = $('<div class="grid-container">').appendTo(wrapper);

  const toggler = $(
    '<span class="collapse-toggler cursor-pointer material-symbols-outlined"></span>'
  ).appendTo(gridCollapsed);
  toggler.text("expand_circle_down");
  gridCollapsed.on("click", function () {
    wrapper.toggleClass("collapsed");
  });

  const collapsedText = $('<div class="collapsed-text"></div>')
    .text(grid.collapsedText ? grid.collapsedText : "...")
    .appendTo(gridCollapsed);

  // table.toggleClass('collapsed', grid.collapsed);
  if (grid.collapsed) {
    wrapper.addClass("collapsed");
  }

  const table = $('<table class="data-grid">').appendTo(container);
  const thead = $("<thead>").appendTo(table);
  const monthRow = $('<tr class="month-row">').appendTo(thead);

  monthRow.append("<th>月份</th>");
  grid.dates.forEach((date) => {
    // 根據 monthNumber 取出月份
    const monthDay = new Date(0, date.month - 1);
    const shortMonth = monthDay.toLocaleString("en", { month: "short" });
    // 建立月份的 th，如果有 weekText 則不設定 colspan，否則根據月份的週數設定 colspan

    const monthTh = $("<th>" + shortMonth + "</th>").appendTo(monthRow);

    let weekCountOfMonth = 0;
    if (typeof date.weekText !== "undefined") {
      weekCountOfMonth = 1;
    } else {
      weekCountOfMonth = date.weekIndexes.length;

      // 如果首日有折疊，再加一
      // const firstDay = new Date(date.year, date.month-1, 1);
      // if (firstDay.getDay()!==1){
      //     weekCountOfMonth++;
      // }
    }

    monthTh.attr("colspan", weekCountOfMonth);
  });

  const weekdayRow = $('<tr class="weekday-row">').appendTo(thead);
  weekdayRow.append("<th>日期</th>");

  let lastWeek = {};
  const colWeeks = [];
  let weekCount = 0;

  grid.dates.forEach((date, di) => {
    if (typeof date.weekText !== "undefined") {
      const weekdayTh = $("<th >" + date.weekText + "</th>").appendTo(
        weekdayRow
      );
      weekCount++;
    } else {
      date.weekIndexes.forEach((weekIndex, wi) => {
        // 根據 date.year、date.month、weekIndex 取出當月該週的開始日、結束日資訊
        const week = getWeekRange(date.year, date.month, weekIndex);
        if (week.starts === lastWeek.starts && week.ends === lastWeek.ends) {
          colWeeks.push(weekCount);
          return;
        } else {
          lastWeek = week;
        }
        weekCount++;

        const weekdayTh = $(
          `<th>` + [week.starts, week.ends].join("<div>~</div>") + "</th>"
        ).appendTo(weekdayRow);
        if (week.isCrossMonth) {
          weekdayTh.attr("colspan", 2);
        }
      });

      // date.weeks.forEach(week => {
      //     const weekdayTh = $('<th >' + [week.starts, week.ends].join('<div>~</div>') + '</th>');
      //     if(week.colspan){
      //         weekdayTh.attr('colspan', week.colspan);
      //     }
      //     weekdayRow.append(weekdayTh);
      // });
    }
  });

  const tbody = $("<tbody>").appendTo(table);
  grid.items.forEach((row) => {
    const tr = $("<tr>").appendTo(tbody);
    tr.append($("<th>項目</th>"));

    let cellStep = 0;

    row.forEach((cell, i) => {
      const td = $(`<td></td>`).appendTo(tr);
      const taskBlock = $('<div class="task">').appendTo(td);
      const titleRow = $('<div class="title-row  flex items-center">').appendTo(
        taskBlock
      );
      const title = $('<span class="title"></span>')
        .text(cell.title)
        .appendTo(titleRow);
      if (cell.tooltip) {
        td.attr("title", cell.tooltip);
      }

      if (cell.tasks) {
        const icon = $(
          '<span class="collapsible material-symbols-outlined">expand_circle_down</span>'
        ).prependTo(titleRow);
        titleRow.on("click", function () {
          taskBlock.toggleClass("expanded"); //.css('transform', 'rotate(45deg)');
        });

        // <span class="material-symbols-outlined">add_circle</span>
        // taskBlock.addClass('collapsible');
        const taskList = $('<div class="task-list">').appendTo(taskBlock);
        cell.tasks.map((task) =>
          $("<div>").text(task.title).addClass(task.state).appendTo(taskList)
        );
      }

      let colspan = +cell.colspan;
      // 有 bug，跨月的第一週的 colspan 會強制 +1，但其實強制+1應該寫在前一個月的最後一週

      colWeeks.forEach((colWeek) => {
        if (cellStep <= colWeek && colWeek < cellStep + cell.colspan) {
          colspan++;
        }
      });

      if (colspan > 1) {
        td.attr("colspan", colspan);
      }
      if (cell.className) {
        td.addClass(cell.className);
      }

      cellStep += colspan || 1;
    });
  });

  return wrapper;
}

// 行政院人事行政總處訂定每年行政機關辦公日曆表
// https://opendataap2.e-land.gov.tw/resource/files/2019-12-03/7f4a95b2ecad152c0d893f3e6f540779.json

function getWeekRange(year, month, weekIndex) {
  const firstDay = new Date(year, month - 1, 1);

  // 周間的第一天是周日(0)，工作日是周一(0+1)到周五(1+4)

  let workDayStart = new Date(firstDay);
  workDayStart.setDate(
    workDayStart.getDate() - firstDay.getDay() + 1 + weekIndex * 7
  );

  let workDayEnd = new Date(workDayStart);
  workDayEnd.setDate(workDayEnd.getDate() + 4);

  return {
    starts: [workDayStart.getMonth() + 1, workDayStart.getDate()].join("/"),
    ends: [workDayEnd.getMonth() + 1, workDayEnd.getDate()].join("/"),
    isCrossMonth: workDayStart.getMonth() !== workDayEnd.getMonth(),
  };
}
