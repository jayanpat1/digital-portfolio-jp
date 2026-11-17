(function () {
    var skillsData = [
        {skill: "Networking fundamentals", category: "Networking", usedIn: "Georgia Southern IT classes"},
        {skill: "IT support and troubleshooting", category: "Support", usedIn: "IT coursework"},
        {skill: "HTML and basic web design", category: "Web", usedIn: "This portfolio website"},
        {skill: "Professional communication", category: "Soft skill", usedIn: "Gulfstream internship"}
    ];

    var timelineData = [
        {when: "June - December 2025", role: "Accounts Payable Intern", where: "Gulfstream Aerospace Corporation, Savannah, GA", focus: "Financial recordkeeping and professional communication"},
        {when: "Present", role: "Information Technology student", where: "Georgia Southern University", focus: "Networking concentration"}
    ];

    var popup = null;

    function getGreeting(hour) {
        if (hour < 12) {
            return "Good morning";
        }
        if (hour < 18) {
            return "Good afternoon";
        }
        return "Good evening";
    }

    var showGreeting = function () {
        var greeting = document.getElementById("greeting");
        if (greeting) {
            greeting.textContent = getGreeting(new Date().getHours()) + ", and welcome to my portfolio!";
        }
    };

    function limitShootDate() {
        var shootDate = document.getElementById("shoot-date");
        if (shootDate) {
            shootDate.min = new Date().toLocaleDateString("en-CA");
        }
    }

    function setupCharCounters() {
        document.querySelectorAll("textarea[maxlength]").forEach(function (box) {
            var counter = document.createElement("span");
            counter.className = "char-count";
            counter.setAttribute("aria-live", "polite");
            box.insertAdjacentElement("afterend", counter);

            var updateCounter = function () {
                counter.textContent = box.value.length + " / " + box.maxLength + " characters";
            };

            box.addEventListener("input", updateCounter);
            if (box.form) {
                box.form.addEventListener("reset", function () {
                    setTimeout(updateCounter, 0);
                });
            }
            updateCounter();
        });
    }

    function getLabelText(input) {
        var label = null;
        if (input.id) {
            label = document.querySelector('label[for="' + input.id + '"]');
        }
        if (!label) {
            label = input.closest("label");
        }
        if (!label) {
            return input.value;
        }
        var strong = label.querySelector("strong");
        return (strong ? strong.textContent : label.textContent).trim();
    }

    function getDisplayValue(form, name) {
        var field = form.elements[name];
        if (!field) {
            return "";
        }
        if (field.tagName === "SELECT") {
            return field.selectedOptions[0] ? field.selectedOptions[0].text : "";
        }
        if (field.length !== undefined) {
            var checkedInputs = Array.from(form.querySelectorAll('input[name="' + name + '"]:checked'));
            return checkedInputs.map(getLabelText).join(", ");
        }
        if (field.type === "checkbox") {
            return field.checked ? "Yes" : "";
        }
        return field.value.trim();
    }

    function parseSummary(text) {
        return text.split(";").map(function (pair) {
            var parts = pair.split(":");
            return {label: parts[0], field: parts[1]};
        });
    }

    function createPopup() {
        var dialog = document.createElement("dialog");
        dialog.className = "popup";
        dialog.setAttribute("aria-live", "polite");
        dialog.addEventListener("click", function (event) {
            if (event.target === dialog) {
                dialog.close();
            }
        });
        document.body.appendChild(dialog);
        return dialog;
    }

    function showPopup(title, bodyNodes, buttons) {
        if (!popup) {
            popup = createPopup();
        }
        popup.innerHTML = "";

        var inner = document.createElement("div");
        inner.className = "popup-inner";

        var heading = document.createElement("h2");
        heading.textContent = title;
        inner.appendChild(heading);

        bodyNodes.forEach(function (node) {
            inner.appendChild(node);
        });

        var buttonRow = document.createElement("div");
        buttonRow.className = "form-buttons";
        buttons.forEach(function (config) {
            var button = document.createElement("button");
            button.type = "button";
            button.textContent = config.text;
            if (config.secondary) {
                button.className = "secondary";
            }
            button.addEventListener("click", config.onClick);
            buttonRow.appendChild(button);
        });
        inner.appendChild(buttonRow);

        popup.appendChild(inner);
        if (!popup.open) {
            popup.showModal();
        }
    }

    function closePopup() {
        if (popup) {
            popup.close();
        }
    }

    function makeParagraph(text) {
        var paragraph = document.createElement("p");
        paragraph.textContent = text;
        return paragraph;
    }

    function makeSummaryList(rows) {
        var list = document.createElement("dl");
        rows.forEach(function (row) {
            var term = document.createElement("dt");
            term.textContent = row.label;
            var detail = document.createElement("dd");
            detail.textContent = row.value;
            list.appendChild(term);
            list.appendChild(detail);
        });
        return list;
    }

    function showThanks(form) {
        var name = getDisplayValue(form, form.dataset.nameField);
        var heading = name ? "Thank you, " + name + "!" : "Thank you!";
        showPopup(heading, [
            makeParagraph(form.dataset.thanks),
            makeParagraph("Your email app should open now. Press Send there to finish.")
        ], [
            {text: "Close", onClick: closePopup}
        ]);
    }

    function showConfirm(form) {
        var rows = parseSummary(form.dataset.summary).map(function (item) {
            return {label: item.label, value: getDisplayValue(form, item.field)};
        }).filter(function (row) {
            return row.value !== "";
        });

        showPopup(form.dataset.popupTitle, [
            makeParagraph("Please check your details before sending:"),
            makeSummaryList(rows)
        ], [
            {text: "Go Back", secondary: true, onClick: closePopup},
            {text: "Looks Good, Send", onClick: function () {
                form.submit();
                showThanks(form);
            }}
        ]);
    }

    function setupPopupForms() {
        document.querySelectorAll("form[data-popup-title]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                showConfirm(form);
            });
        });
    }

    function buildTable(config) {
        var table = document.createElement("table");

        var caption = document.createElement("caption");
        caption.textContent = config.caption;
        table.appendChild(caption);

        var head = document.createElement("thead");
        var headRow = document.createElement("tr");
        config.columns.forEach(function (column) {
            var cell = document.createElement("th");
            cell.scope = "col";
            cell.textContent = column.label;
            if (config.onSort) {
                cell.className = "sortable";
                cell.tabIndex = 0;
                if (config.sortKey === column.key) {
                    cell.setAttribute("aria-sort", config.sortDirection === 1 ? "ascending" : "descending");
                }
                var sortThis = function () {
                    config.onSort(column.key);
                };
                cell.addEventListener("click", sortThis);
                cell.addEventListener("keydown", function (event) {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        sortThis();
                    }
                });
            }
            headRow.appendChild(cell);
        });
        head.appendChild(headRow);
        table.appendChild(head);

        var body = document.createElement("tbody");
        config.rows.forEach(function (row) {
            var bodyRow = document.createElement("tr");
            config.columns.forEach(function (column) {
                var cell = document.createElement("td");
                cell.textContent = row[column.key];
                bodyRow.appendChild(cell);
            });
            body.appendChild(bodyRow);
        });
        table.appendChild(body);

        if (config.footerText) {
            var foot = document.createElement("tfoot");
            var footRow = document.createElement("tr");
            var footCell = document.createElement("td");
            footCell.colSpan = config.columns.length;
            footCell.textContent = config.footerText;
            footRow.appendChild(footCell);
            foot.appendChild(footRow);
            table.appendChild(foot);
        }

        return table;
    }

    function setupTimelineTable() {
        var holder = document.getElementById("timeline-table");
        if (!holder) {
            return;
        }
        holder.appendChild(buildTable({
            caption: "Where I have studied and worked",
            columns: [
                {key: "when", label: "When"},
                {key: "role", label: "Role"},
                {key: "where", label: "Where"},
                {key: "focus", label: "Focus"}
            ],
            rows: timelineData
        }));
    }

    function setupSkillsTable() {
        var holder = document.getElementById("skills-table");
        var filter = document.getElementById("skill-filter");
        if (!holder || !filter) {
            return;
        }

        var sortKey = "skill";
        var sortDirection = 1;

        var categories = skillsData.map(function (item) {
            return item.category;
        }).filter(function (category, index, list) {
            return list.indexOf(category) === index;
        });

        ["All categories"].concat(categories).forEach(function (category, index) {
            var option = document.createElement("option");
            option.value = index === 0 ? "all" : category;
            option.textContent = category;
            filter.appendChild(option);
        });

        function sortBy(key) {
            if (sortKey === key) {
                sortDirection = sortDirection * -1;
            } else {
                sortKey = key;
                sortDirection = 1;
            }
            drawSkills();
        }

        function drawSkills() {
            var chosen = filter.value;
            var rows = skillsData.filter(function (item) {
                return chosen === "all" || item.category === chosen;
            }).sort(function (a, b) {
                return a[sortKey].localeCompare(b[sortKey]) * sortDirection;
            });

            holder.innerHTML = "";
            holder.appendChild(buildTable({
                caption: "Skills grouped by category",
                columns: [
                    {key: "skill", label: "Skill"},
                    {key: "category", label: "Category"},
                    {key: "usedIn", label: "Where I use it"}
                ],
                rows: rows,
                footerText: rows.length + (rows.length === 1 ? " skill listed" : " skills listed"),
                sortKey: sortKey,
                sortDirection: sortDirection,
                onSort: sortBy
            }));
        }

        filter.addEventListener("change", drawSkills);
        drawSkills();
    }

    showGreeting();
    limitShootDate();
    setupCharCounters();
    setupPopupForms();
    setupTimelineTable();
    setupSkillsTable();
})();
