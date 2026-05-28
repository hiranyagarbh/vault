#!/usr/bin/env python
# coding: utf-8

# In[31]:


def checkParaBalance(expr):
    stack = []
    for char in expr:
        if char in ['(', '[', '{']:
            stack.append(char)
        else:
            if not stack:
                return False
            cur_char = stack.pop()
            if cur_char == '(':
                if char != ')':
                    return False
            if cur_char == '[':
                if char != ']':
                    return False
            if cur_char == '{':
                if char != '}':
                    return False
    if stack:
        return False
    return True

