package jpabook.jpashop.controller;

import jpabook.jpashop.domain.Item.Item;
import jpabook.jpashop.service.ItemService;
import lombok.*;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import java.awt.print.Book;
import java.util.List;

@Getter @Setter
@Controller
@RequiredArgsConstructor
    public class ItemController {

    private final ItemService itemService;
    @GetMapping(value = "/items/new")
    public String createForm(Model model) {
        model.addAttribute("form", new BookForm());
        return "items/createItemForm";
    }

    @GetMapping(value = "/items")
    public String list(Model model) {
        List<Item> items = itemService.findItems();
        model.addAttribute("items", items);
        return "items/itemList";
    }
}

